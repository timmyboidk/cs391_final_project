import { NextResponse } from 'next/server';
import { after } from 'next/server';
import getCollection from '@/db';
import { getAllGames } from '@/lib/scraper';
import { calculateEVForGames } from '@/lib/ev-calculator';

export const dynamic = 'force-dynamic';

export async function GET() {
    let collection = null;
    let cachedData = null;

    // 1. Try to connect to DB and get cache (Safely)
    try {
        collection = await getCollection('games');
        cachedData = await collection.findOne(
            {},
            { sort: { updatedAt: -1 }, projection: { _id: 0 } }
        );
    } catch (dbError) {
        console.warn("MongoDB connection failed, falling back to live scrape:", dbError);
        // We continue without crashing; collection remains null
    }

    // Define Background Refresh Task
    const performBackgroundRefresh = async () => {
        if (!collection) return; // Cannot save if DB is down
        console.log('Starting background data refresh...');
        try {
            const rawGames = await getAllGames();
            const gamesWithEV = calculateEVForGames(rawGames);

            const payload = {
                updatedAt: new Date().toISOString(),
                games: gamesWithEV,
            };

            await collection.insertOne(payload);
            console.log('Background refresh complete.');
        } catch (err) {
            console.error('Background refresh failed:', err);
        }
    };

    // 2. Decide: Return Cache or Scrape Live
    if (cachedData) {
        // HIT: Return fast data, update in background
        after(performBackgroundRefresh);

        return NextResponse.json(cachedData, {
            headers: { 'X-Data-Source': 'MongoDB-Cache' },
        });
    } else {
        // MISS (or DB down): Scrape live (Slow but reliable)
        try {
            console.log('No cache available. Scraping live...');
            const rawGames = await getAllGames();
            const gamesWithEV = calculateEVForGames(rawGames);

            const payload = {
                updatedAt: new Date().toISOString(),
                games: gamesWithEV,
            };

            // Try to save to DB for next time, if connection exists
            if (collection) {
                try {
                    await collection.insertOne(payload);
                } catch (writeErr) {
                    console.error("Failed to write to MongoDB:", writeErr);
                }
            }

            return NextResponse.json(payload, {
                headers: { 'X-Data-Source': 'Live-Scrape' },
            });
        } catch (scrapeError) {
            console.error('Fatal Scrape Error:', scrapeError);
            return NextResponse.json(
                { error: 'Failed to fetch data' },
                { status: 500 }
            );
        }
    }
}