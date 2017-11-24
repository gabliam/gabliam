import { ExpressionParser } from '@gabliam/expression';
import {
  InjectContainer,
  INJECT_CONTAINER_KEY,
  Container
} from '@gabliam/core';
import { CacheManager } from '../cache-manager';
import { CACHE_MANAGER } from '../constant';
import { Cache } from '../cache';

const NO_RESULT = Symbol('NO_RESULT');

export type KeyGenerator = (...args: any[]) => string;

export interface CacheableOptions {
  /**
   * names of caches
   */
  cacheNames: string | string[];

  /**
   * Key generator.
   * By default it is a concatenation
   */
  keyGenerator?: KeyGenerator;

  key?: string;
}

function isCacheableOptions(obj: any): obj is CacheableOptions {
  return typeof obj === 'object' && obj.hasOwnProperty('cacheNames');
}

export function Cacheable(
  value: string | string[] | CacheableOptions
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

    const cacheNames: string[] = [];
    let keyGenerator = defaultKeyGenerator;
    let key: string | undefined | null;
    if (isCacheableOptions(value)) {
      if (Array.isArray(value.cacheNames)) {
        cacheNames.push(...value.cacheNames);
      } else {
        cacheNames.push(value.cacheNames);
      }
      ({ key, keyGenerator = defaultKeyGenerator } = value);
    } else {
      if (Array.isArray(value)) {
        cacheNames.push(...value);
      } else {
        cacheNames.push(value);
      }
    }
    const method = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
      // arguments by default are all arguments
      let extractArgs = (...vals: any[]) => vals;

      // if a key is passed, create a key
      if (key) {
        extractArgs = (...vals: any[]) => {
          try {
            let extractedArgs = container
              .get<ExpressionParser>(ExpressionParser)
              .parseExpression(key!)
              .getValue<any>({ args: vals });

            if (extractedArgs) {
              extractedArgs = Array.isArray(extractedArgs)
                ? extractedArgs
                : [extractedArgs];
            }
            return extractedArgs;
          } catch (e) {
            console.error('cache Error', e);
            return undefined;
          }
        };
      }

      const cacheKey = keyGenerator(extractArgs(...args));

      // cacheKey is undefined so we skip cache
      if (cacheKey === undefined) {
        method.apply(this, args);
      }

      const cacheManager: CacheManager = container.get<CacheManager>(
        CACHE_MANAGER
      );

      let result: any = NO_RESULT;
      const caches: Cache[] = [];
      for (const cacheName of cacheNames) {
        const cache = cacheManager.getCache(cacheName);
        if (cache) {
          caches.push(cache);
          const val = await cache.get(cacheKey);
          if (val !== undefined && result === NO_RESULT) {
            result = val;
          }
        }
      }

      if (result === NO_RESULT) {
        result = method.apply(this, args);
      }

      for (const cache of caches) {
        await cache.putIfAbsent(cacheKey, result);
      }

      return result;
    };
  };
}

function defaultKeyGenerator(...args: any[]) {
  const k = [];
  for (const arg of args) {
    try {
      if (typeof arg === 'string') {
        k.push(arg);
      } else {
        k.push(JSON.stringify(arg));
      }
    } catch {}
  }
  return k.join('');
}
