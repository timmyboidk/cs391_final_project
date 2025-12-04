import { NextResponse } from 'next/server';
import { cache, getCacheTTL } from '@/lib/cache';
import { getAllGames } from '@/lib/scraper';
import { calculateEVForGames } from '@/lib/ev-calculator';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'masslottery:games';

export async function GET() {
    try {
        // Try cache first
        const cached = cache.get(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    'X-Cache': 'HIT',
                },
            });
        }

        const rawGames = await getAllGames();
        const gamesWithEV = calculateEVForGames(rawGames);

        const payload = {
            updatedAt: new Date().toISOString(),
            games: gamesWithEV,
        };

        // Cache result
        cache.set(CACHE_KEY, payload, getCacheTTL());

        return NextResponse.json(payload, {
            headers: {
                'X-Cache': 'MISS',
            },
        });
    } catch (error) {
        console.error('Error in GET /api/games:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch Massachusetts lottery games',
                details:
                    process.env.NODE_ENV === 'development'
                        ? error instanceof Error
                            ? error.message
                            : 'Unknown error'
                        : 'An error occurred',
            },
            { status: 500 }
        );
    }
}
