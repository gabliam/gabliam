import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
} from '@gabliam/core';
import { NO_RESULT } from '../constant';
import {
  CacheConfig,
  CacheOptions,
  createCacheConfig,
  extractCacheInternalOptions,
} from './cache-options';

export function Cacheable(
  value?: string | string[] | CacheOptions
): MethodDecorator {
  return function(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    InjectContainer()(target.constructor);
    const cacheInternalOptions = extractCacheInternalOptions(target, value);
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
  };
}
