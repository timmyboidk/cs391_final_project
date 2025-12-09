/*
 * Library: In-Memory Cache Utility
 * ----------------------------------------------------------------------------
 * Responsible: Natalie King
 *
 * Description:
 * A simple in-memory caching class to store temporary data.
 *
 * Logic & Reasoning:
 * - While we moved to MongoDB for persistence, this class remains useful for
 * short-term caching during development or for specific non-persistent tasks.
 * - It implements a Time-To-Live (TTL) mechanism to automatically invalidate
 * stale data, preventing memory leaks and ensuring data freshness.
 * ----------------------------------------------------------------------------
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

     //Get cached data if it exists and hasn't expired

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    // Set data in cache with TTL in milliseconds
    set<T>(key: string, data: T, ttlMs: number): void {
        const now = Date.now();
        const entry: CacheEntry<T> = {
            data,
            timestamp: now,
            expiresAt: now + ttlMs,
        };

        this.cache.set(key, entry);
    }

     //Check if a key exists and is not expired
    has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Check if its expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

     //Manually invalidate a cache entry
    invalidate(key: string): void {
        this.cache.delete(key);
    }

     //Clear all cache entries

    clear(): void {
        this.cache.clear();
    }

    //Get cache metadata for a key

    getMetadata(key: string): { age: number; ttl: number } | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        return {
            age: now - entry.timestamp,
            ttl: entry.expiresAt - now,
        };
    }


    //Clean up expired entries

    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

// Export singleton instance
export const cache = new SimpleCache();

// Helper to get cache TTL from environment or use default
export function getCacheTTL(): number {
    const envTTL = process.env.CACHE_TTL_MINUTES;
    const minutes = envTTL ? parseInt(envTTL) : 60; // 60 min by default
    return minutes * 60 * 1000; 
}
