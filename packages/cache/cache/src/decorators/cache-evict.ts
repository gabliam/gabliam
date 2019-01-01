import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  makePropDecorator,
} from '@gabliam/core';
import { Cache } from '../cache';
import {
  CacheConfig,
  CacheInternalOptions,
  CacheOptions,
  createCacheConfig,
  extractCacheInternalOptions,
  getCacheGroup,
} from './cache-options';

export interface CacheEvictOptions extends CacheOptions {
  /**
   * Indicates whether a cache-wide eviction needs to be performed rather then just an entry eviction (based on the key).
   */
  allEntries?: boolean;

  /**
   * Indicate whether the eviction should occur before the method executes.
   */
  beforeInvocation?: boolean;
}

function isCacheEvictOptions(obj: any): obj is CacheEvictOptions {
  return typeof obj === 'object' && obj.hasOwnProperty('cacheNames');
}

function extractCacheEvictInternalOptions(
  value?: string | string[] | CacheEvictOptions
): CacheEvict {
  let allEntries = false;
  let beforeInvocation = false;
  if (isCacheEvictOptions(value)) {
    ({ allEntries = false, beforeInvocation = false } = value);
  }

  return {
    ...extractCacheInternalOptions(value),
    allEntries,
    beforeInvocation,
  };
}

/**
 * Type of the `CacheEvict` decorator / constructor function.
 */
export interface CacheEvictDecorator {
  /**
   * Decorator that marks a method triggers a cache evict operation.
   *
   * @usageNotes
   *
   * ```typescript
   * @Service()
   * class SampleController {
   *    @CacheEvict('test')
   *    saveToDatabase(entity: any) {
   *    }
   * }
   * ```
   *
   */
  (value?: string | string[] | CacheEvictOptions): MethodDecorator;

  /**
   * see the `@CacheEvict` decorator.
   */
  new (value?: string | string[] | CacheEvictOptions): any;
}

/**
 * Type of metadata for an `CacheEvict` property.
 */
interface CacheEvict extends CacheInternalOptions {
  /**
   * Indicates whether a cache-wide eviction needs to be performed rather then just an entry eviction (based on the key).
   */
  allEntries: boolean;

  /**
   * Indicate whether the eviction should occur before the method executes.
   */
  beforeInvocation: boolean;
}

export const CacheEvict: CacheEvictDecorator = makePropDecorator(
  'CacheEvict',
  (value?: string | string[] | CacheEvictOptions): CacheEvict => {
    return extractCacheEvictInternalOptions(value);
  },
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
    cacheInternalOptions: CacheEvict
  ) => {
    InjectContainer()(target.constructor);
    const method = descriptor.value;
    let cacheGroup: string;
    let cacheConfig: CacheConfig;
    descriptor.value = async function(...args: any[]) {
      if (!cacheGroup) {
        cacheGroup = getCacheGroup(target.constructor);
      }
      if (!cacheConfig) {
        const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
        cacheConfig = await createCacheConfig(
          cacheGroup,
          container,
          cacheInternalOptions
        );
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
      if (
        !cacheInternalOptions.beforeInvocation &&
        !cacheConfig.veto(args, result)
      ) {
        await evict(
          cacheConfig.caches,
          cacheKey,
          cacheInternalOptions.allEntries
        );
      }

      return result;
    };
  }
);

async function evict(caches: Cache[], cacheKey: string, allEntries: boolean) {
  for (const cache of caches) {
    if (allEntries) {
      await cache.clear();
    } else {
      await cache.evict(cacheKey);
    }
  }
}
