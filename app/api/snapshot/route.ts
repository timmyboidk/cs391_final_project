import { NextResponse } from 'next/server';
import getCollection from '@/db';
import { getAllGames } from '@/lib/scraper';
import { calculateEVForGames } from '@/lib/ev-calculator';

export const dynamic = 'force-dynamic';
//This part grabs the latest live data and saves it to MongoDB.
// It calculates "Instant Stats" (Value, Scarcity, Inventory) from this live data and returns it to the frontend.

export async function GET() {
    try {// Scrape  Data
        const rawGames = await getAllGames();
        if (!rawGames.length) {
            return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });}

      // Calculate Statistics
        const games = calculateEVForGames(rawGames);
        const timestamp = new Date();

    // Prepare Snapshot for DB
        const snapshotDocs = games.map(game => ({
            gameNumber: game.gameNumber,
            name: game.name,
            price: game.price,
            timestamp,
    //metrics needed for future trend analysis
            currentEV: game.currentEV,
             evPerDollar: game.evPerDollar,
            estimatedRemainingTickets: game.estimatedRemainingTickets,
            topPrizeRemaining: game.prizeTiers[0]?.prizesRemaining || 0,
             secondPrizeRemaining: game.prizeTiers[1]?.prizesRemaining || 0,
            topPrizeValue: game.prizeTiers[0]?.prizeValue || 0
        }));

        // Save to MongoDB
        const collection = await getCollection();
        await collection.insertMany(snapshotDocs);

        // Perform Instant Analysis
        // Since we have no history yet, we analyze the relative value of games for noew
        //Best Value (EV per Dollar)
        const bestValue = [...games]
            .sort((a, b) => b.evPerDollar - a.evPerDollar)
            .slice(0, 3)
            .map(g => ({
                name: g.name,
                 val: g.evPerDollar,
                price: g.price
            }));
        // Scarcity (Top Prizes almost gone)
        const scarceGames = games
            .filter(g => g.prizeTiers[0]?.prizesRemaining > 0 && g.prizeTiers[0]?.prizesRemaining <= 3).map(g => ({
                name: g.name,
                remaining: g.prizeTiers[0].prizesRemaining,
                value: g.prizeTiers[0].prizeValue}));
        // Bulk Inventory (Which games have the most tickets left)
        const massiveInventory = [...games]
            .sort((a, b) => b.estimatedRemainingTickets - a.estimatedRemainingTickets)
            .slice(0, 3)
            .map(g => ({
                name: g.name,
                count: g.estimatedRemainingTickets
            }));
        return NextResponse.json({
            success: true,
            timestamp,
            analysis: {
                bestValue,
                scarceGames,
                massiveInventory}}
        );
    } catch (error: any) {
        console.error("Snapshot Error:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}