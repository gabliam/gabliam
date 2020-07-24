import { Bean, InjectContainer, PluginConfig, Value, Joi } from '@gabliam/core';
import { CACHE_MANAGER } from './constant';
import { ConstructableCacheManager, ICacheGroup } from './cache-manager';
import { ConstructableCache } from './cache';
import * as d from 'debug';
import { SimpleCacheManager } from './simple-cache-manager';
import {
  CachePgkNotInstalledError,
  CacheManagerPgkNotInstalledError,
} from './error';
import { MemoryCache, NoOpCache } from './caches';
import * as _ from 'lodash';
const debug = d('Gabliam:Plugin:CachePlugin');

export interface PluginConfig {
  cacheManager: string | ConstructableCacheManager;

  groups: { [k: string]: PluginGroupConfig } | undefined;

  dynamic: boolean;

  defaultCache: string | ConstructableCache;

  defaultOptionsCache?: Object;
}

export interface PluginGroupConfig {
  defaultCache?: ConstructableCache;

  defaultOptionsCache?: object;

  caches: { [k: string]: PluginCacheConfig } | undefined;
}

export interface PluginCacheConfig {
  cache?: string | ConstructableCache;

  options?: Object;
}

const stringOrClass = Joi.alternatives().try(Joi.string(), Joi.func());

const cacheValidator = Joi.object({
  cache: stringOrClass,
  options: Joi.object(),
});

const pluginValidator = Joi.object().keys({
  cacheManager: stringOrClass.default('SimpleCacheManager'),
  dynamic: Joi.boolean().default(true),
  groups: Joi.object()
    .pattern(
      /.*/,
      Joi.object({
        defaultCache: stringOrClass,
        defaultOptionsCache: Joi.object(),
        caches: Joi.object().pattern(/.*/, cacheValidator),
      })
    )
    .default(undefined),
  defaultCache: stringOrClass.default('NoOpCache'),
  defaultOptionsCache: Joi.object(),
});

@InjectContainer()
@PluginConfig()
export class CachePluginConfig {
  @Value('application.cacheConfig', pluginValidator)
  cacheConfig: PluginConfig | undefined;

  @Bean(CACHE_MANAGER)
  createCacheManager(): any {
    if (this.cacheConfig === undefined) {
      return this.createDefaultManager();
    }
    const groups = new Map<string, ICacheGroup>();
    if (this.cacheConfig.groups) {
      for (const [
        groupKey,
        { defaultCache, caches, defaultOptionsCache },
      ] of Object.entries(this.cacheConfig.groups)) {
        const groupCache: ICacheGroup = {
          defaultCache,
          defaultOptionsCache,
          caches: new Map(),
        };

        groups.set(groupKey, groupCache);
        if (caches) {
          for (const [cacheKey, { cache, options }] of Object.entries(caches)) {
            const CacheConstruc = this.getCacheConstruct(
              cache || defaultCache || this.cacheConfig.defaultCache
            );
            const cacheOptions = _.merge(
              {},
              this.cacheConfig.defaultOptionsCache || {},
              defaultOptionsCache || {},
              options || {}
            );

            groupCache.caches.set(
              cacheKey,
              new CacheConstruc(cacheKey, cacheOptions)
            );
          }
        }
      }
    }
    const CacheManagerConstruct = this.getCacheManagerConstruct(
      this.cacheConfig.cacheManager
    );

    return new CacheManagerConstruct(
      groups,
      this.cacheConfig.dynamic,
      this.getCacheConstruct(this.cacheConfig.defaultCache),
      this.cacheConfig.defaultOptionsCache
    );
  }

  private getCacheManagerConstruct(
    cacheManager: string | ConstructableCacheManager
  ): ConstructableCacheManager {
    if (typeof cacheManager === 'string') {
      switch (cacheManager) {
        case 'SimpleCacheManager':
          return SimpleCacheManager;
        default:
          try {
            return <ConstructableCacheManager>require(cacheManager).default;
          } catch {
            throw new CacheManagerPgkNotInstalledError(cacheManager);
          }
      }
    }
    return cacheManager;
  }

  private getCacheConstruct(
    cache: string | ConstructableCache
  ): ConstructableCache {
    if (typeof cache === 'string') {
      switch (cache) {
        case 'MemoryCache':
          return MemoryCache;
        case 'NoOpCache':
          return NoOpCache;
        default:
          try {
            return <ConstructableCache>require(cache).default;
          } catch {
            throw new CachePgkNotInstalledError(cache);
          }
      }
    }

    return cache;
  }

  private createDefaultManager() {
    debug('Create Defaut cache Manager');
    return new SimpleCacheManager(new Map(), true);
  }
}
