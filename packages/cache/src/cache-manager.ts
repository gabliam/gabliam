import { Cache, ConstructableCache } from './cache';

export interface CacheGroup {
  defaultCache?: ConstructableCache;

  defaultOptionsCache?: object;

  caches: Map<string, Cache>;
}

/**
 * Gabliam central cache manager SPI.
 * Allows for retrieving named {@link Cache} regions.
 */
export interface CacheManager {
  /**
   * Return the cache associated with the given name.
   * @param name the group cache (must not be {@code null})
   * @param name the cache identifier (must not be {@code null})
   * @return the associated cache, or {@code undefined} if none found
   */
  getCache(name: string, groupName?: string): Promise<Cache | undefined>;

  /**
   * Return a collection of the cache names known by this manager.
   * @return the names of all caches known by the cache manager
   */
  getCacheNames(): string[];
}

export interface ConstructableCacheManager {
  new (
    groups: Map<string, CacheGroup>,
    dynamic: boolean,
    defaultCache: ConstructableCache,
    defaultOptionsCache?: object
  ): CacheManager;
}
