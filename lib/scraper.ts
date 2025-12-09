/*
 * Library: Web Scraper Module
 * ----------------------------------------------------------------------------
 * Responsible: Natalie King
 *
 * Description:
 * This module is responsible for navigating the Massachusetts Lottery website
 * and extracting raw game data.
 *
 * Logic & Reasoning:
 * 1. Hybrid Approach: We use a combination of `fetch` for the main API list
 * (fast) and `Puppeteer` (headless browser) for individual game pages.
 * Puppeteer is necessary because the lottery site uses dynamic JavaScript
 * to render prize tables, which standard fetch/Cheerio cannot see.
 * 2. Concurrency Control: We implemented a `processBatch` function with a
 * limit (MAX_CONCURRENT_BROWSERS = 3) to prevent crashing the server's
 * memory when scraping dozens of pages simultaneously.
 * 3. Robust Parsing: We use specific regex patterns to handle inconsistent
 * text formats (e.g., "$250,000" vs "Free Ticket").
 * ----------------------------------------------------------------------------
 */

import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {LotteryGame, PrizeTier} from '@/types/lottery';

const BASE_URL = 'https://www.masslottery.com';
const API_URL = 'https://www.masslottery.com/api/v1/games';

// Max concurrent browser instances for batch processing
const MAX_CONCURRENT_BROWSERS = 3;

interface MALotteryGame {
    name: string;
    identifier: string;
    id: number;
    gameType: string;
    topPrize: number;
    price: number;
    odds?: string;
    startDate?: string;
}

 //Fetch and parse all scratcher games from MA Lottery API
export async function getAllGameLinks(): Promise<{ name: string; url: string; price: number; gameNumber: string }[]> {
    try {
        const response = await fetch(API_URL, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch games API: ${response.status}`);
        }

        const allGames: MALotteryGame[] = await response.json();

        // Filter for only Scratch games
        const scratchGames = allGames.filter(game => game.gameType === 'Scratch');

        const games = scratchGames.map(game => {
            // get URL based on identifier only
            const url = `${BASE_URL}/games/draw-and-instants/${game.identifier}`;

            return {
                name: game.name,
                url,
                price: game.price,
                gameNumber: game.id.toString()
            };
        });

        console.log(`Found ${games.length} scratch games`);
        return games;
    } catch (error) {
        console.error('Error fetching game links:', error);
        return [];
    }
}

 //Parse a number from text

function parseNumber(text: string): number {
    const cleaned = text.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
}

 //Parsing prize value from string to int. "$250,000" = 250000

function parsePrizeValue(prizeText: string, ticketPrice: number): number {
    if (prizeText.toLowerCase().includes('free') || prizeText.toLowerCase().includes('ticket')) {
        return ticketPrice;
    }
    return parseNumber(prizeText);
}

 //Fetch and parse a single game page using Puppeteer for dynamic content

export async function parseGamePage(url: string, priceFromAPI?: number): Promise<LotteryGame | null> {
    let browser;
    try {
        console.log(`Parsing game page: ${url}`);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] //launching puppeteer in headless mode
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'); //config the scraper

        // Navigate to the page and wait for content 
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for the prize table specifically. Otherwise we'll timeout
        await page.waitForSelector('table, .prize-table, [class*="prize"]', { timeout: 10000 }).catch(() => {
            console.warn(`Prize table selector not found for ${url}`);
        });

        // get the HTML content 
        const html = await page.content();
        const $ = cheerio.load(html);

        // get game name from page title
        const title = $('title').text().trim();
        let gameName = title.split('|')[0].trim();

        if (!gameName) {
            // Just in case the name isn't in the page title, we can extract it from the URL
            const urlParts = url.split('/');
            gameName = urlParts[urlParts.length - 1].replace(/-/g, ' ').toUpperCase();
        }

        // Getting the game # from the url
        const urlParts = url.split('/');
        const gameNumber = urlParts[urlParts.length - 1];

        // Use price from API if available, otherwise we'll try to get it from the page. A little redundant, but with government databases its necessary. They SUCK
        const price = priceFromAPI || 0;

        // Get overall odds
        let overallOddsText = '1 in 1';
        let overallOddsValue = 1;

        $('*').each((_, el) => { 
            const text = $(el).text();
            if (text.includes('Overall Odds') || text.toLowerCase().includes('overall odds')) {
                const match = text.match(/1\s+in\s+([\d.,]+)/i);
                if (match) {
                    overallOddsText = `1 in ${match[1]}`;
                    overallOddsValue = parseFloat(match[1].replace(/,/g, ''));
                    return false; 
                }
            }
        });

        // Get last updated date
        let lastUpdated = '';
        $('*').each((_, el) => {
            const text = $(el).text();
            if (text.includes('Last Updated') || text.includes('as of')) {
                lastUpdated = text.trim();
                return false; // break
            }
        });

        // Parse prize table
        const prizeTiers: PrizeTier[] = [];

        $('table').each((_, table) => {
            const $table = $(table);

            // Try to find the header row
            const headers = $table.find('th, thead td').map((_, th) =>
                $(th).text().trim().toLowerCase()
            ).get();

            // Look for tables with prize data
            const hasPrize = headers.some(h => h.includes('prize'));

            if (hasPrize || headers.length > 0) {
                // combing through data rows
                const rows = $table.find('tbody tr, tr').filter((_, row) => {
                    const $row = $(row);
                    return $row.find('td').length > 0;
                });

                rows.each((_, row) => {
                    const $row = $(row);
                    const cells = $row.find('td').map((_, td) => $(td).text().trim()).get();

                    if (cells.length >= 2) {

                        const prizeAndOddsText = cells[0];
                        const statusText = cells[1];

                        // Skiping the header rows
                        if (prizeAndOddsText.toLowerCase().includes('prize')) {
                            return;
                        }

                        // Extract prize amount using regex.
                        const prizeMatch = prizeAndOddsText.match(/^(\$[\d,]+?)(?=1\s*in)/);
                        if (!prizeMatch) return;

                        const prizeText = prizeMatch[1];
                        const prizeValue = parsePrizeValue(prizeText, 0); // temp price. Will be filled in later

                        // Extract odds using regex
                        const oddsMatch = prizeAndOddsText.match(/1\s*in\s*([\d,]+(?:\.\d+)?)/i);
                        if (!oddsMatch) return;

                        const odds = parseNumber(oddsMatch[1]);
                        const oddsText = `1 in ${oddsMatch[1]}`;

                        // Extract individual counts for different prize tiers
                        const startMatch = statusText.match(/([\d,]+)\s*Start/i);
                        const claimedMatch = statusText.match(/([\d,]+)\s*Claimed/i);
                        const remainingMatch = statusText.match(/([\d,]+)\s*Remaining/i);

                        if (!startMatch || !remainingMatch) return;

                        const prizesAtStart = parseNumber(startMatch[1]);
                        const prizesRemaining = parseNumber(remainingMatch[1]);

                        if (prizeValue > 0 && odds > 0 && prizesAtStart > 0) {
                            prizeTiers.push({
                                prize: prizeText,
                                prizeValue,
                                odds,
                                oddsText,
                                prizesAtStart,
                                prizesRemaining //compiling into prizeTiers
                            });
                        }
                    }
                });
            }
        });

        await browser.close(); //closing the puppeteer

        if (prizeTiers.length === 0) { //we dont have any for this game
            console.warn(`No prize tiers found for ${gameName} at ${url}`);
            return null;
        }

        return {
            name: gameName,
            gameNumber,
            price,
            overallOdds: overallOddsText,
            overallOddsValue,
            url,
            prizeTiers,
            lastUpdated
        };
    } catch (error) {
        console.error(`Error parsing game page ${url}:`, error);
        if (browser) {
            await browser.close();
        }
        return null;
    }
}

    //Processing an array of items in batches with a concurrency limit. Doing this because sequential is slow, and large batches will cause a timeout. 3 concurrent headless browsers seems to function fine.
async function processBatch<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    batchSize: number
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map((item, batchIndex) =>
            processor(item, i + batchIndex)
        );

        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${batch.length} games in parallel)`);
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}

 //Fetching all games with a limit for testing
export async function getAllGames(limit?: number): Promise<LotteryGame[]> {
    const gameLinks = await getAllGameLinks();
    const limitedLinks = limit ? gameLinks.slice(0, limit) : gameLinks;

    console.log(`Fetching ${limitedLinks.length} games in batches of ${MAX_CONCURRENT_BROWSERS}...`);

    // Process games in batches to limit concurrent browser instances
    const results = await processBatch(
        limitedLinks,
        async (link, index) => {
            console.log(`Processing game ${index + 1}/${limitedLinks.length}: ${link.name}`);
            return await parseGamePage(link.url, link.price);
        },
        MAX_CONCURRENT_BROWSERS
    );

    // Filtering out any null results
    return results.filter((game): game is LotteryGame => game !== null);
}
