import {
  InjectContainer,
  INJECT_CONTAINER_KEY,
  Container
} from '@gabliam/core';
import {
  CacheOptions,
  extractCacheInternalOptions,
  CacheConfig,
  createCacheConfig
} from './cache-options';

export function CachePut(
  value: string | string[] | CacheOptions
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
    const cacheInternalOptions = extractCacheInternalOptions(value);
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

      const result = await method.apply(this, args);

      if (!cacheConfig.veto(args, result)) {
        for (const cache of cacheConfig.caches) {
          await cache.put(cacheKey, result);
        }
      }

      return result;
    };
  };
}
