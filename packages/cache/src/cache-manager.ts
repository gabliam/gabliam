import { Cache } from './cache';

/**
 * Gabliam central cache manager SPI.
 * Allows for retrieving named {@link Cache} regions.
 */
export interface CacheManager {
  /**
   * Return the cache associated with the given name.
   * @param name the cache identifier (must not be {@code null})
   * @return the associated cache, or {@code null} if none found
   */
  getCache(name: string): Cache | undefined;

  /**
   * Return a collection of the cache names known by this manager.
   * @return the names of all caches known by the cache manager
   */
  getCacheNames(): string[];
}
