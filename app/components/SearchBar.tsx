/*
 * Component: Search Bar
 * ----------------------------------------------------------------------------
 * Responsible: Zachary Memoli
 *
 * Description:
 * A reusable UI component for filtering data tables.
 *
 * Logic & Reasoning:
 * - We "lifted state up" to the parent (Table.tsx). This component relies purely
 * on props (`searchTerm`, `onSearchTermChange`) rather than managing its own state.
 * - This makes the component a "Pure Component" (or controlled component),
 * making it easier to test and reuse in other parts of the app if needed.
 * ----------------------------------------------------------------------------
 */

"use client";

import React from "react";

//search bar props 
interface SearchBarProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    loading?: boolean;
    totalGames:number;
    filteredGames: number;
}

// search bar with props
const SearchBar: React.FC<SearchBarProps>=({
    searchTerm,
    onSearchTermChange,
    loading = false,
    totalGames,
    filteredGames,
})=>{
    return (
            <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center">
                {/* Search input */}
                <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="text-2xl">🔍</div>
                    <input
                        type="text"
                        placeholder="Search by game name, number, or price..."
                        value={searchTerm}
                        //on search term change implemented here, for re-map useState in Table Component
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-2xl shadow-md focus:outline-none focus:shadow-lg"
                        style={{
                        backgroundColor: "#ffffff",
                        border: "2px solid #fcd5ce",
                        color: "#5a4a42",
                        }}
                    />
                </div>

                {/* Count of visible vs total games */}
                {!loading && (
                <div
                    className="px-6 py-3 rounded-2xl shadow-md text-center"
                    style={{
                    backgroundColor: "#ffe5d9",
                    color: "#8b7b6b",
                    fontWeight: 600,
                    }}
                >
                    {filteredGames} of {totalGames} games
                </div>
                )}
            </div>
        </div>
    );
}
    

//export search bar to Table components
export default SearchBar;

        
