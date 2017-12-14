import { Cache } from '../cache';
const LRU = require('lru-cache');

export interface MemoryCacheOptions<K = any, V = any> {
  /**
   * The maximum size of the cache, checked by applying the length
   * function to all values in the cache. Not setting this is kind of silly,
   * since that's the whole purpose of this lib, but it defaults to `Infinity`.
   */
  max?: number;

  /**
   * Maximum age in ms. Items are not pro-actively pruned out as they age,
   * but if you try to get an item that is too old, it'll drop it and return
   * undefined instead of giving it to you.
   */
  maxAge?: number;

  /**
   * By default, if you set a `maxAge`, it'll only actually pull stale items
   * out of the cache when you `get(key)`. (That is, it's not pre-emptively
   * doing a `setTimeout` or anything.) If you set `stale:true`, it'll return
   * the stale value before deleting it. If you don't set this, then it'll
   * return `undefined` when you try to get a stale entry,
   * as if it had already been deleted.
   */
  stale?: boolean;

  /**
   * By default, if you set a `dispose()` method, then it'll be called whenever
   * a `set()` operation overwrites an existing key. If you set this option,
   * `dispose()` will only be called when a key falls out of the cache,
   * not when it is overwritten.
   */
  noDisposeOnSet?: boolean;

  /**
   * Function that is used to calculate the length of stored items.
   * If you're storing strings or buffers, then you probably want to do
   * something like `function(n, key){return n.length}`. The default
   * is `function(){return 1}`, which is fine if you want to store
   * `max` like-sized things. The item is passed as the first argument,
   * and the key is passed as the second argument.
   */
  length?(value: V): number;

  /**
   * Function that is called on items when they are dropped from the cache.
   * This can be handy if you want to close file descriptors or do other
   * cleanup tasks when items are no longer accessible. Called with `key, value`.
   * It's called before actually removing the item from the internal cache,
   * so if you want to immediately put it back in, you'll have to do that in
   * a `nextTick` or `setTimeout` callback or it won't do anything.
   */
  dispose?(key: K, value: V): void;
}

export class MemoryCache implements Cache {
  private name: string;

  private store: any;

  constructor(name: string, private options?: MemoryCacheOptions) {
    this.name = name;
  }

  async start() {
    this.store = LRU(this.options);
  }

  async stop() {
    this.store.reset();
  }

  getName(): string {
    return this.name;
  }
  getNativeCache(): object {
    return this;
  }
  async get<T>(key: string): Promise<T | null | undefined> {
    return this.store.get(key);
  }
  async put(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  async putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): Promise<T | null | undefined> {
    if (!this.store.has(key)) {
      this.store.set(key, value);
      return null;
    }
    return this.store.get(key);
  }
  async evict(key: string): Promise<void> {
    this.store.del(key);
  }
  async clear(): Promise<void> {
    this.store.reset();
  }
}
