import { CacheManager } from './cache-manager';
import { Cache, ConstructableCache } from './cache';
import { NoOpCache } from './caches/no-op-cache';

export class SimpleCacheManager implements CacheManager {
  private startedCache: Map<string, boolean> = new Map();
  constructor(
    private cacheMap: Map<string, Cache>,
    private dynamic: boolean,
    private defaultCache: ConstructableCache = NoOpCache,
    private defaultOptionsCache?: object
  ) {}

  async getCache(name: string) {
    if (!this.cacheMap.has(name) && this.dynamic) {
      this.cacheMap.set(name, this.constructCache(name));
    }

    const cache = this.cacheMap.get(name);

    if (!cache) {
      return cache;
    }

    if (!this.startedCache.has(name)) {
      await cache.start();
      this.startedCache.set(name, true);
    }

    return cache;
  }
  getCacheNames() {
    const names: string[] = [];
    for (const [, cache] of this.cacheMap.entries()) {
      names.push(cache.getName());
    }

    return names;
  }

  private constructCache(name: string) {
    return new this.defaultCache(name, this.defaultOptionsCache);
  }
}
