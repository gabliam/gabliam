import { CacheManager } from './cache-manager';
import { Cache, ConstructableCache } from './cache';
import { NoOpCache } from './caches/no-op-cache';

export class SimpleCacheManager implements CacheManager {
  constructor(
    private cacheMap: Map<string, Cache>,
    private dynamic: boolean,
    private defaultCache: ConstructableCache = NoOpCache,
    private defaultOptionsCache?: object
  ) {}

  getCache(name: string) {
    if (!this.cacheMap.has(name) && this.dynamic) {
      this.cacheMap.set(name, this.constructCache(name));
    }

    return this.cacheMap.get(name);
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
