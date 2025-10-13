type CacheValue<T> = {
  value: T;
  expiresAt: number;
};

type CacheStore = Map<string, CacheValue<unknown>>;

const globalForCache = globalThis as typeof globalThis & {
  __aiHairstyleCache?: CacheStore;
};

const store: CacheStore =
  globalForCache.__aiHairstyleCache ??
  (globalForCache.__aiHairstyleCache = new Map());

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getCache<T>(key: string): T | undefined {
  const item = store.get(key);
  if (!item) return undefined;
  if (Date.now() > item.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return item.value as T;
}

export function deleteCache(key: string) {
  store.delete(key);
}

export function clearCacheWithPrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
