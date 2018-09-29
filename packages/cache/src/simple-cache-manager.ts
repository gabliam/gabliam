import * as _ from 'lodash';
import { ConstructableCache } from './cache';
import { CacheManager, CacheGroup } from './cache-manager';
import { NoOpCache } from './caches/no-op-cache';

export class SimpleCacheManager implements CacheManager {
  private startedCache: Map<string, boolean> = new Map();
  constructor(
    private group: Map<string, CacheGroup>,
    private dynamic: boolean,
    private defaultCache: ConstructableCache = NoOpCache,
    private defaultOptionsCache?: object
  ) {}

  async getCache(name: string, groupName = 'default') {
    if (!this.group.has(groupName) && this.dynamic) {
      this.group.set(groupName, {
        defaultCache: this.defaultCache,
        defaultOptionsCache: this.defaultOptionsCache,
        caches: new Map(),
      });
    }

    const group = this.group.get(groupName);
    if (!group) {
      return group;
    }

    if (!group.caches.has(name) && this.dynamic) {
      group.caches.set(name, this.constructCache(group, name));
    }

    const cache = group.caches.get(name);

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
    for (const [, group] of this.group.entries()) {
      for (const [, cache] of group.caches.entries()) {
        names.push(cache.getName());
      }
    }

    return names;
  }

  private constructCache(group: CacheGroup, name: string) {
    const defaultCache = group.defaultCache || this.defaultCache;
    const optionsCache = _.merge(
      {},
      this.defaultOptionsCache || {},
      group.defaultOptionsCache || {}
    );
    return new defaultCache(name, optionsCache);
  }
}
