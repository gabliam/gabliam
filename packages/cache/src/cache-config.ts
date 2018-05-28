import { Bean, InjectContainer, PluginConfig, Value, Joi } from '@gabliam/core';
import { CACHE_MANAGER } from './constant';
import { ConstructableCacheManager } from './cache-manager';
import { ConstructableCache, Cache } from './cache';
import * as d from 'debug';
import { SimpleCacheManager } from './simple-cache-manager';
import {
  CachePgkNotInstalledError,
  CacheManagerPgkNotInstalledError
} from './error';
import { MemoryCache, NoOpCache } from './caches';
const debug = d('Gabliam:Plugin:CachePlugin');

export interface PluginConfig {
  cacheManager: string | ConstructableCacheManager;

  cacheMap: { [k: string]: PluginCacheConfig } | undefined;

  dynamic: boolean;

  defaultCache: string | ConstructableCache;

  defaultOptionsCache?: Object;
}

export interface PluginCacheConfig {
  cache: string | ConstructableCache;

  options?: Object;
}

const stringOrClass = Joi.alternatives().try([Joi.string(), Joi.func()]);

const pluginValidator = Joi.object().keys({
  cacheManager: stringOrClass.default('SimpleCacheManager'),
  dynamic: Joi.boolean().default(true),
  cacheMap: Joi.object()
    .pattern(
      /.*/,
      Joi.object({
        cache: stringOrClass.required(),
        options: Joi.object()
      })
    )
    .default(undefined),
  defaultCache: stringOrClass.default('NoOpCache'),
  defaultOptionsCache: Joi.object()
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
    const cacheMap = new Map<string, Cache>();
    if (this.cacheConfig.cacheMap) {
      for (const [cacheKey, { cache, options }] of Object.entries(
        this.cacheConfig.cacheMap
      )) {
        const CacheConstruc = this.getCacheConstruct(cache);
        cacheMap.set(cacheKey, new CacheConstruc(cacheKey, options));
      }
    }
    const CacheManagerConstruct = this.getCacheManagerConstruct(
      this.cacheConfig.cacheManager
    );

    return new CacheManagerConstruct(
      cacheMap,
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
    return new SimpleCacheManager(new Map<string, Cache>(), true);
  }
}
