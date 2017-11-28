import {
  CacheOptions,
  extractCacheInternalOptions,
  CacheConfig,
  createCacheConfig,
  CacheInternalOptions
} from './cache-options';
import { Cache } from '../cache';
import {
  InjectContainer,
  Container,
  INJECT_CONTAINER_KEY
} from '@gabliam/core';

export interface CacheEvictOptions extends CacheOptions {
  allEntries?: boolean;

  beforeInvocation?: boolean;
}

interface CacheInternalEvictOptions extends CacheInternalOptions {
  allEntries: boolean;

  beforeInvocation: boolean;
}

function isCacheEvictOptions(obj: any): obj is CacheEvictOptions {
  return typeof obj === 'object' && obj.hasOwnProperty('cacheNames');
}

function extractCacheEvictInternalOptions(
  value: string | string[] | CacheEvictOptions
): CacheInternalEvictOptions {
  let allEntries = false;
  let beforeInvocation = false;
  if (isCacheEvictOptions(value)) {
    ({ allEntries = false, beforeInvocation = false } = value);
  }

  return {
    ...extractCacheInternalOptions(value),
    allEntries,
    beforeInvocation
  };
}

export function CacheEvict(
  value: string | string[] | CacheEvictOptions
): MethodDecorator {
  return function(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    if (
      Reflect.getMetadata('design:returntype', target, propertyKey) !== Promise
    ) {
      throw new Error('Cacheable must decorate an async method');
    }

    InjectContainer()(target.constructor);
    const cacheInternalOptions = extractCacheEvictInternalOptions(value);
    const method = descriptor.value;
    let cacheConfig: CacheConfig;
    descriptor.value = async function(...args: any[]) {
      if (!cacheConfig) {
        const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
        cacheConfig = await createCacheConfig(container, cacheInternalOptions);
      }

      if (!cacheConfig.passCondition(...args)) {
        return method.apply(this, args);
      }

      const extractedArgs = cacheConfig.extractArgs(...args);
      // if args is undefined so no cache
      if (extractedArgs === undefined) {
        return method.apply(this, args);
      }

      const cacheKey = cacheInternalOptions.keyGenerator(
        ...cacheConfig.extractArgs(...args)
      );

      // cacheKey is undefined so we skip cache
      /* istanbul ignore next */
      if (cacheKey === undefined) {
        return method.apply(this, args);
      }

      if (cacheInternalOptions.beforeInvocation) {
        await evict(
          cacheConfig.caches,
          cacheKey,
          cacheInternalOptions.allEntries
        );
      }

      const result = await method.apply(this, args);
      if (!cacheInternalOptions.beforeInvocation) {
        await evict(
          cacheConfig.caches,
          cacheKey,
          cacheInternalOptions.allEntries
        );
      }

      return result;
    };
  };
}

async function evict(caches: Cache[], cacheKey: string, allEntries: boolean) {
  for (const cache of caches) {
    if (allEntries) {
      await cache.clear();
    } else {
      await cache.evict(cacheKey);
    }
  }
}
