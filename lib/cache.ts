type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number = 30) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiresAt });
}

export function delCache(key: string) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}

