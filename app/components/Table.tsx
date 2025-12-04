"use client";

import { useEffect, useState } from "react";

interface PrizeTier {
    prize: string;
    prizeValue: number;
    odds: number;
    oddsText: string;
    prizesAtStart: number;
    prizesRemaining: number;
}

interface GameWithEV {
    name: string;
    gameNumber: string;
    price: number;
    overallOdds: string;
    overallOddsValue: number;
    url: string;
    prizeTiers: PrizeTier[];
    lastUpdated: string;


    initialEV: number;
    currentEV: number;
    netInitialEV: number;
    netCurrentEV: number;
    evPerDollar: number;
    estimatedTotalTickets: number;
    estimatedRemainingTickets: number;
}

interface GamesResponse {
    updatedAt: string;
    games: GameWithEV[];
}

export default function Table() {
    const [data, setData] = useState<GamesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/games", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`API error ${res.status}`);
                }
                const json: GamesResponse = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                setError("Failed to load lottery data. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <div className="mt-12 font-mono mx-auto max-w-4xl border-4 border-green-800 bg-white p-6 text-center">
                Loading lottery data…
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="mt-12 font-mono mx-auto max-w-4xl border-4 border-red-800 bg-red-50 p-6 text-center text-red-700">
                {error ?? "No data returned from API."}
            </div>
        );
    }

    const { games, updatedAt } = data;

    return (
        <div className="mt-12 font-mono mx-auto max-w-4xl border-4 border-green-800 bg-white p-6">
            <div className="flex justify-between items-baseline mb-2 border-b-4 border-green-800 pb-2">
                <h2 className="text-2xl font-bold text-green-800 uppercase">
                    Lottery Data
                </h2>
                <p className="text-xs text-green-700">
                    Updated: {new Date(updatedAt).toLocaleString()}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-green-800 text-white">
                        <th className="p-3 border-2 border-green-900">Game</th>
                        <th className="p-3 border-2 border-green-900">Price</th>
                        <th className="p-3 border-2 border-green-900">Odds</th>
                        <th className="p-3 border-2 border-green-900">Initial EV</th>
                        <th className="p-3 border-2 border-green-900">Current EV</th>
                        <th className="p-3 border-2 border-green-900">EV per $</th>
                        <th className="p-3 border-2 border-green-900">Current Net</th>
                        <th className="p-3 border-2 border-green-900">Link</th>
                    </tr>
                    </thead>

                    <tbody>
                    {games.map((game, idx) => (
                        <tr
                            key={game.gameNumber}
                            className={idx % 2 === 0 ? "bg-green-50" : "bg-green-100"}
                        >
                            <td className="p-3 border-2 border-green-900">
                                {game.name}
                                <span className="block text-xs text-green-700">
                    #{game.gameNumber}
                  </span>
                            </td>
                            <td className="p-3 border-2 border-green-900">
                                ${game.price.toFixed(2)}
                            </td>
                            <td className="p-3 border-2 border-green-900">
                                {game.overallOdds}
                            </td>
                            <td className="p-3 border-2 border-green-900">
                                ${game.initialEV.toFixed(2)}
                            </td>
                            <td className="p-3 border-2 border-green-900">
                                ${game.currentEV.toFixed(2)}
                            </td>
                            <td className="p-3 border-2 border-green-900">
                                ${game.evPerDollar.toFixed(2)}
                            </td>
                            <td className="p-3 border-2 border-green-900">
                                {game.netCurrentEV >= 0 ? "+" : "-"}$
                                {Math.abs(game.netCurrentEV).toFixed(2)}
                            </td>
                            <td className="p-3 border-2 border-green-900 underline">
                                <a
                                    href={game.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-green-700"
                                >
                                    Game Page
                                </a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <p className="mt-3 text-xs text-center text-green-700">
                    Showing {games.length} scratch games from Mass Lottery.
                </p>
            </div>
        </div>
    );
}
