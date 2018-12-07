import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
} from '@gabliam/core';
import {
  CacheConfig,
  CacheOptions,
  createCacheConfig,
  extractCacheInternalOptions,
  CacheInternalOptions,
} from './cache-options';

export function CachePut(
  value?: string | string[] | CacheOptions
): MethodDecorator {
  return function(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    InjectContainer()(target.constructor);
    let cacheInternalOptions: CacheInternalOptions;
    const method = descriptor.value;
    let cacheConfig: CacheConfig;
    descriptor.value = async function(...args: any[]) {
      if (!cacheInternalOptions) {
        cacheInternalOptions = extractCacheInternalOptions(target, value);
      }
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
