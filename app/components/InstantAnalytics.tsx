'use client';
import { useEffect, useState } from 'react';

interface InstantAnalysisData {
    success: boolean;
    timestamp: string;
    analysis: { bestValue: Array<{ name: string; val: number; price: number }>; scarceGames: Array<{ name: string; remaining: number; value: number }>;
        massiveInventory: Array<{ name: string; count: number }>; };}

export default function InstantAnalytics() {
    const [data, setData] = useState<InstantAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch('/api/snapshot') //fetch the snapshot which also saves to DB
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));}, []);
    if (loading) {
        return (<div className="w-full p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 animate-pulse">
                <p className="text-gray-500 font-medium">Analyzing current market data...</p>
                <p className="text-xs text-gray-400 mt-2">Syncing with database...</p>
            </div>
        );
    }

    if (!data || !data.success) return null;
    return (
        <div className="mt-10 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Market Snapshot 📊</h2>
                <p className="text-gray-500 text-sm">
                    Real-time analysis as of {new Date(data.timestamp).toLocaleTimeString()}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Best Value */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">💎</span> Best Value
                    </h3>
                    <div className="space-y-3">
                        {data.analysis.bestValue.map((game, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">{game.name}</div>
                                    <div className="text-xs text-gray-500">${game.price} Ticket</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">${game.val.toFixed(2)}</div>
                                    <div className="text-[10px] text-green-700 uppercase font-bold">Return/$1</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/*Scarcity Alert */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">⏳</span> High Scarcity
                    </h3>
                    {data.analysis.scarceGames.length > 0 ? (
                        <div className="space-y-3">
                            {data.analysis.scarceGames.map((game, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-gray-800 text-sm">{game.name}</div>
                                        <div className="text-xs text-red-600 font-medium">Top Prize: ${game.value.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center min-w-[3rem]">
                                        <div className="font-bold text-red-600 text-lg">{game.remaining}</div>
                                        <div className="text-[10px] text-red-500">LEFT</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            No scarcity alerts right now.
                        </div>
                    )}
                </div>

                {/*Deep Inventory */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📦</span> Most Stock
                    </h3>
                    <div className="space-y-3">
                        {data.analysis.massiveInventory.map((game, i) => (
                            <div key={i} className="p-3 bg-blue-50 rounded-xl">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-semibold text-gray-800 text-sm">{game.name}</div>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: '100%' }} // Relative visualization could be added here
                                    ></div>
                                </div>
                                <div className="text-right text-xs text-blue-600 mt-1 font-medium">
                                    {game.count.toLocaleString()} Tickets Est.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}