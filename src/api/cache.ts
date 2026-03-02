/**
 * API fetch with localStorage fallback. On failure, show last cached data and last_updated.
 */
const CACHE_PREFIX = "wbc2026_";

export interface CachedResult<T> {
    data: T | null;
    last_updated: string | null;
}

export function getCached<T>(key: string): CachedResult<T> {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return { data: null, last_updated: null };
        const parsed = JSON.parse(raw) as { data: T; last_updated: string };
        return { data: parsed.data, last_updated: parsed.last_updated };
    } catch {
        return { data: null, last_updated: null };
    }
}

export function setCached<T>(key: string, data: T): void {
    try {
        const last_updated = new Date().toISOString();
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, last_updated }));
    } catch {
        // ignore
    }
}

export interface FetchWithFallbackResult<T> {
    data: T | null;
    fromCache: boolean;
    last_updated: string | null;
    error: string | null;
}

export async function fetchWithFallback<T>(
    url: string,
    cacheKey: string
): Promise<FetchWithFallbackResult<T>> {
    const cached = getCached<T>(cacheKey);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as T;
        setCached(cacheKey, data);
        return {
            data,
            fromCache: false,
            last_updated: new Date().toISOString(),
            error: null,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        if (cached.data != null) {
            return {
                data: cached.data,
                fromCache: true,
                last_updated: cached.last_updated,
                error: message,
            };
        }
        return {
            data: null,
            fromCache: false,
            last_updated: null,
            error: message,
        };
    }
}
