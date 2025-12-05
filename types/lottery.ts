/*
 * Type Definitions: Lottery Interfaces
 * ----------------------------------------------------------------------------
 * Responsible: Natalie King
 *
 * Description:
 * Centralized TypeScript interfaces for the project's data structures.
 *
 * Logic & Reasoning:
 * - Using a centralized types file ensures consistency across the Scraper,
 * Calculator, API, and Frontend Components.
 * - `GameWithEV` extends `LotteryGame`, inheriting all its properties while
 * adding the calculated fields. This keeps our types DRY (Don't Repeat Yourself).
 * ----------------------------------------------------------------------------
 */

export interface PrizeTier {
    prize: string;
    prizeValue: number;
    odds: number;
    oddsText: string;
    prizesAtStart: number;
    prizesRemaining: number;
}

export interface LotteryGame {
    name: string;
    gameNumber: string;
    price: number;
    overallOdds: string;
    overallOddsValue: number;
    url: string;
    prizeTiers: PrizeTier[];
    lastUpdated?: string;
}

export interface GameWithEV extends LotteryGame {
    initialEV: number;
    currentEV: number;
    netInitialEV: number;
    netCurrentEV: number;
    evPerDollar: number; // Current EV per dollar spent
    estimatedTotalTickets: number;
    estimatedRemainingTickets: number;
}
