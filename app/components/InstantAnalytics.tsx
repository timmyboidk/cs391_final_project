/*
 * Component: Instant Market Analytics
 * ----------------------------------------------------------------------------
 * Responsible: Zaiyang Yu
 *
 * Description:
 * A dashboard widget that processes raw game data into actionable insights:
 * Best Value, Scarcity (Ending Soon), and High Inventory games.
 *
 * Logic & Reasoning:
 * 1. Performance: We utilize the `useMemo` hook for the statistical calculations.
 * Since filtering through the game array is computationally expensive, `useMemo`
 * ensures we only recalculate these stats when the source `data` changes,
 * preventing unnecessary re-renders when the user interacts with other parts of the UI.
 * 2. Scarcity Logic: We specifically defined "Scarce" as games with <= 5 top prizes
 * remaining to create a sense of urgency for the user based on real data.
 * ----------------------------------------------------------------------------
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { GameWithEV } from '@/types/lottery';

// Define the response shape from /api/games
interface GamesResponse {
    updatedAt: string;
    games: GameWithEV[];
}

export default function InstantAnalytics() {
    const [data, setData] = useState<GamesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Fetch from the working /api/games endpoint (same as Table.tsx)
        fetch('/api/games')
            .then(async (res) => {
                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                return res.json();
            })
            .then((json: GamesResponse) => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load market analytics.");
                setLoading(false);
            });
    }, []);

    // 2. Calculate the "Digest" stats client-side with NEW Logic
    const stats = useMemo(() => {
        if (!data || !data.games) return null;

        const games = data.games;

        // A. Best Value: Keep ALL > $1.00 EV per Dollar
        // Sorted by Value Descending (Highest value first)
        const bestValue = games
            .filter(g => g.evPerDollar > 1.0)
            .sort((a, b) => b.evPerDollar - a.evPerDollar);

        // B. Scarcity: Games with <= 5 Top Prizes remaining
        // Sorted by Amount (Asc) THEN Remaining (Asc)
        const scarce = games
            .filter(g => g.prizeTiers[0]?.prizesRemaining > 0 && g.prizeTiers[0]?.prizesRemaining <= 5)
            .map(g => ({
                ...g,
                topPrizeVal: g.prizeTiers[0]?.prizeValue || 0,
                topPrizeCount: g.prizeTiers[0]?.prizesRemaining || 0
            }))
            .sort((a, b) => {
                // Primary Sort: Amount Descending
                const diffAmount =  b.topPrizeVal - a.topPrizeVal;
                if (diffAmount !== 0) return diffAmount;
                // Secondary Sort: Remaining Ascending
                return a.topPrizeCount - b.topPrizeCount;
            });

        // C. Inventory: Return ANY > 80 tickets remaining
        // Sorted by Count Descending (Highest stock first)
        const inventory = games
            .filter(g => g.estimatedRemainingTickets > 80)
            .sort((a, b) => b.estimatedRemainingTickets - a.estimatedRemainingTickets);

        return { bestValue, scarce, inventory };
    }, [data]);

    if (loading) {
        return (
            <div className="mt-8 border-4 border-green-800 bg-white p-8 font-mono text-center animate-pulse">
                <div className="text-xl text-green-800 font-bold uppercase">Loading Analytics Digest...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 border-4 border-red-800 bg-red-50 p-6 font-mono text-center text-red-900 font-bold">
                {error}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="mt-8 border-4 border-green-800 bg-white p-6 font-mono">
            <div className="text-center border-b-4 border-green-800 pb-4 mb-6">
                <h2 className="text-3xl font-bold text-green-800 uppercase">
                    Market Digest
                </h2>
                <p className="text-green-700 text-sm mt-1 italic">
                    Live insights from {data?.games.length} active games
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Best Value Digest */}
                <div className="border-4 border-green-800 bg-green-50 p-4 flex flex-col max-h-96">
                    <h3 className="text-lg font-bold text-green-900 border-b-4 border-green-800 pb-2 mb-4 uppercase flex items-center gap-2">
                         Best Value ({stats.bestValue.length})
                    </h3>
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {stats.bestValue.length > 0 ? (
                            stats.bestValue.map((game) => (
                                <div key={game.gameNumber} className="flex justify-between items-start border-b-2 border-green-800/20 pb-2 last:border-0">
                                    <div className="flex-1 pr-2">
                                        <div className="font-bold text-black text-sm leading-tight">
                                            {game.name}
                                        </div>
                                        <div className="text-xs text-green-700 font-bold mt-1">
                                            ${game.price} Ticket
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-green-800 text-lg">
                                            ${game.evPerDollar.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-green-900 font-bold uppercase">Return/$1</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-green-700 text-sm italic py-4">
                                No games {">"} $1.00 Value
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Scarcity Digest */}
                <div className="border-4 border-green-800 bg-green-50 p-4 flex flex-col max-h-96">
                    <h3 className="text-lg font-bold text-green-900 border-b-4 border-green-800 pb-2 mb-4 uppercase flex items-center gap-2">
                         Scarcity ({stats.scarce.length})
                    </h3>
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {stats.scarce.length > 0 ? (
                            stats.scarce.map((game) => (
                                <div key={game.gameNumber} className="flex justify-between items-center border-b-2 border-green-800/20 pb-2 last:border-0">
                                    <div className="flex-1 pr-2">
                                        <div className="font-bold text-black text-sm leading-tight">
                                            {game.name}
                                        </div>
                                        <div className="text-xs text-red-700 font-bold uppercase mt-1">
                                            ${game.topPrizeVal.toLocaleString()} Prize
                                        </div>
                                    </div>
                                    <div className="text-center bg-white border-2 border-green-800 px-2 py-1 shrink-0">
                                        <div className="font-bold text-red-600 text-lg leading-none">{game.topPrizeCount}</div>
                                        <div className="text-[9px] text-black font-bold uppercase">Left</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-40 flex items-center justify-center text-green-700 text-sm italic font-bold border-2 border-dashed border-green-800">
                                NO ALERTS
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. High Stock Digest */}
                <div className="border-4 border-green-800 bg-green-50 p-4 flex flex-col max-h-96">
                    <h3 className="text-lg font-bold text-green-900 border-b-4 border-green-800 pb-2 mb-4 uppercase flex items-center gap-2">
                         High Stock ({stats.inventory.length})
                    </h3>
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {stats.inventory.map((game) => (
                            <div key={game.gameNumber} className="border-b-2 border-green-800/20 pb-2 last:border-0">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="font-bold text-black text-sm leading-tight pr-2">
                                        {game.name}
                                    </div>
                                    <div className="text-xs text-green-800 font-bold bg-white px-1 border border-green-800 shrink-0">
                                        {game.estimatedRemainingTickets.toLocaleString()}
                                    </div>
                                </div>
                                <div className="w-full bg-white h-3 border-2 border-green-800">
                                    <div
                                        className="bg-green-600 h-full"
                                        style={{ width: '85%' }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}