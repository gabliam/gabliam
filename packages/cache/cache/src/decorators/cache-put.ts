import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  makePropDecorator,
} from '@gabliam/core';
import {
  CacheConfig,
  CacheInternalOptions,
  CacheOptions,
  createCacheConfig,
  extractCacheInternalOptions,
  getCacheGroup,
} from './cache-options';

/**
 * Type of the `CachePut` decorator / constructor function.
 */
export interface CachePutDecorator {
  /**
   * Decorator that marks a method triggers a cache put operation.
   *
   * @usageNotes
   *
   * ```typescript
   * @Service()
   * class SampleController {
   *    @CachePut('test')
   *    saveToDatabase(entity: any) {
   *    }
   * }
   * ```
   *
   */
  (value?: string | string[] | CacheOptions): MethodDecorator;

  /**
   * see the `@CachePut` decorator.
   */
  new (value?: string | string[] | CacheOptions): any;
}

/**
 * Type of metadata for an `CachePut` property.
 */
// tslint:disable-next-line:no-empty-interface
interface CachePut extends CacheInternalOptions {}

export const CachePut: CachePutDecorator = makePropDecorator(
  'CachePut',
  (value?: string | string[] | CacheOptions): CachePut => {
    return extractCacheInternalOptions(value);
  },
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
    cacheInternalOptions: CachePut
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

      const result = await method.apply(this, args);

      if (!cacheConfig.veto(args, result)) {
        for (const cache of cacheConfig.caches) {
          await cache.put(cacheKey, result);
        }
      }

      return result;
    };
  }
);
