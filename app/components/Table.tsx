/*
 * Component: Data Table
 * ----------------------------------------------------------------------------
 * Responsible: Alex Olson
 * Description: Created table template/styling and implemented column sorting
 *
 * Responsible: Natalie King
 * Description: Retrieved and cleaned data in the backend ready to be sorted for the table
 *
 * Logic & Reasoning:
 * 1. Data Fetching: We use `useEffect` to fetch from our internal API (/api/games).
 * This ensures we decouple the frontend from the direct DB connection.
 * 2. Sorting: We implemented a custom `colSort` function using `useState`.
 * We sort client-side (using JavaScript's .sort()) rather than server-side
 * because the dataset (< 100 items) is small enough that a DB query would be
 * slower than local processing.
 * 3. Search: The search logic filters the `games` array in real-time based on
 * user input before mapping it to the DOM.
 * ----------------------------------------------------------------------------
 */

// Table.tsx
// Main Data Table Element for our Lottery Data...

"use client";

import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

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
    const [searchTerm, setSearchTerm] = useState("");

    // creating a hook of which attribute to sort by (starting just with name we can change if we want)
    const [sortKey, setSortKey] = useState<keyof GameWithEV>('name');
    // using another hook to decide what direction to sort (ascending or descending)
    const [sortDir, setSortDir] = useState<'ascending' | 'descending'>('ascending');

    // operation to decide which direction we are sorting based on column
    // toggles direction if we are sorting again by current key (else resets for new col)
    const colSort = (key: keyof GameWithEV) => {
        if (sortKey === key) {
            if (sortDir === 'ascending') {
                setSortDir('descending');
            } else {
                setSortDir('ascending');
            }
            return;
        }
        setSortDir('ascending');
        setSortKey(key);
    }

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

    const lowerCased = searchTerm.trim().toLowerCase();

    const filteredGames = games.filter((game)=>{
        if(!lowerCased){
             return true;
        }
        const nameMatch = game.name.toLowerCase().includes(lowerCased);
        const numberMatch = game.gameNumber.toLowerCase().includes(lowerCased);
        const priceMatch = game.price.toString().includes(lowerCased);

        return nameMatch || numberMatch || priceMatch;
    });

    // sorting using the hooks and comparisons...
    const sorted = [...filteredGames].sort((a, b) => {
        const v1 = a[sortKey];
        const v2 = b[sortKey];
        // consulted documentation on type checking in React (typeof)
        if (typeof v2 === "string" && typeof v1 === "string") {
            if (sortDir === "ascending") {
                return v1.localeCompare(v2)
            } else {
                return v2.localeCompare(v1)
            }
        }
        // if we get here its a number not string...
        const n1 = Number(v1);
        const n2 = Number(v2);
        if (sortDir === "ascending") {
            return n1 - n2;
        } else {
            return n2 - n1;
        }
    });

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

            <SearchBar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                loading={loading}
                totalGames={games.length}
                filteredGames={filteredGames.length}
            />

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-green-800 text-white">
                        <th onClick={()=> colSort("name")} className="p-3 border-2 border-green-900">Game</th>
                        <th onClick={()=> colSort("price")} className="p-3 border-2 border-green-900">Price</th>
                        <th onClick={()=> colSort("overallOddsValue")} className="p-3 border-2 border-green-900">Odds</th>
                        <th onClick={()=> colSort("initialEV")} className="p-3 border-2 border-green-900">Initial EV</th>
                        <th onClick={()=> colSort("currentEV")} className="p-3 border-2 border-green-900">Current EV</th>
                        <th onClick={()=> colSort("evPerDollar")} className="p-3 border-2 border-green-900">EV per $</th>
                        <th onClick={()=> colSort("netCurrentEV")} className="p-3 border-2 border-green-900">Current Net</th>
                        <th className="p-3 border-2 border-green-900">Link</th>
                    </tr>
                    </thead>

                    <tbody>
                    {sorted.map((game, idx) => (
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
                    Showing {filteredGames.length} scratch games from Mass Lottery.
                </p>
            </div>
        </div>
    );
}
