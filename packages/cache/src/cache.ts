export interface ConstructableCache {
  new (name: string, options?: object): Cache;
}

/**
 * Interface that defines common cache operations.
 *
 * <b>Note:</b> Due to the generic use of caching, it is recommended that
 * implementations allow storage of <tt>null</tt> values (for example to
 * cache methods that return {@code null}).
 */
export interface Cache {
  /**
   * Return the cache name.
   */
  getName(): string;

  /**
   * Return the underlying native cache provider.
   */
  getNativeCache(): object;

  /**
   * Return the value to which this cache maps the specified key,
   * generically specifying a type that return value will be cast to.
   * <p>Note: This variant of {@code get} does not allow for differentiating
   * between a cached {@code null} value and no cache entry found at all.
   * Use the standard {@link #get(Object)} variant for that purpose instead.
   * @param key the key whose associated value is to be returned
   * @param type the required type of the returned value (may be
   * {@code null} to bypass a type check; in case of a {@code null}
   * value found in the cache, the specified type is irrelevant)
   * @return the value to which this cache maps the specified key
   * (which may be {@code null} itself), or also {@code null} if
   * the cache contains no mapping for this key
   * @throws IllegalStateException if a cache entry has been found
   * but failed to match the specified type
   * @since 4.0
   * @see #get(Object)
   */
  get<T>(key: string): T | undefined | null;

  /**
   * Associate the specified value with the specified key in this cache.
   * <p>If the cache previously contained a mapping for this key, the old
   * value is replaced by the specified value.
   * @param key the key with which the specified value is to be associated
   * @param value the value to be associated with the specified key
   */
  put(key: string, value: any): void;

  /**
   * Atomically associate the specified value with the specified key in this cache
   * if it is not set already.
   * <p>This is equivalent to:
   * <pre><code>
   * Object existingValue = cache.get(key);
   * if (existingValue == null) {
   *     cache.put(key, value);
   *     return null;
   * } else {
   *     return existingValue;
   * }
   * </code></pre>
   * except that the action is performed atomically. While all out-of-the-box
   * {@link CacheManager} implementations are able to perform the put atomically,
   * the operation may also be implemented in two steps, e.g. with a check for
   * presence and a subsequent put, in a non-atomic way. Check the documentation
   * of the native cache implementation that you are using for more details.
   * @param key the key with which the specified value is to be associated
   * @param value the value to be associated with the specified key
   * @return the value to which this cache maps the specified key (which may be
   * {@code null} itself), or also {@code null} if the cache did not contain any
   * mapping for that key prior to this call. Returning {@code null} is therefore
   * an indicator that the given {@code value} has been associated with the key.
   * @since 4.1
   */
  putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): T | undefined | null;

  /**
   * Evict the mapping for this key from this cache if it is present.
   * @param key the key whose mapping is to be removed from the cache
   */
  evict(key: string): void;

  /**
   * Remove all mappings from the cache.
   */
  clear(): void;
}
