import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  makePropDecorator,
} from '@gabliam/core';
import { NO_RESULT } from '../constant';
import {
  CacheConfig,
  CacheInternalOptions,
  CacheOptions,
  createCacheConfig,
  extractCacheInternalOptions,
  getCacheGroup,
} from './cache-options';

/**
 * Type of the `Cacheable` decorator / constructor function.
 */
export interface CacheableDecorator {
  /**
   * Decorator that marks a method triggers a cache operation.
   *
   * @usageNotes
   *
   * ```typescript
   * @Service()
   * class SampleController {
   *    @Cacheable('test')
   *    saveToDatabase(entity: any) {
   *    }
   * }
   * ```
   *
   */
  (value?: string | string[] | CacheOptions): MethodDecorator;

  /**
   * see the `@Cacheable` decorator.
   */
  new (value?: string | string[] | CacheOptions): any;
}

/**
 * Type of metadata for an `Cacheable` property.
 */
interface Cacheable extends CacheInternalOptions {}

export const Cacheable: CacheableDecorator = makePropDecorator(
  'Cacheable',
  (value?: string | string[] | CacheOptions): Cacheable => {
    return extractCacheInternalOptions(value);
  },
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
    cacheInternalOptions: Cacheable
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

      let result: any = NO_RESULT;
      for (const cache of cacheConfig.caches) {
        const val = await cache.get(cacheKey);
        if (val !== undefined && val !== NO_RESULT) {
          result = val;
          break;
        }
      }

      if (result === NO_RESULT) {
        result = await method.apply(this, args);
      }

      if (!cacheConfig.veto(args, result)) {
        for (const cache of cacheConfig.caches) {
          await cache.putIfAbsent(cacheKey, result);
        }
      }

      return result;
    };
  }
);
