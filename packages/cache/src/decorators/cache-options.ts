import { ExpressionParser, Expression } from '@gabliam/expression';
import { Container } from '@gabliam/core';
import { CacheManager } from '../cache-manager';
import { CACHE_MANAGER } from '../constant';
import { Cache } from '../cache';

export type KeyGenerator = (...args: any[]) => string | undefined;

export interface CacheOptions {
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

  condition?: string;
}

export interface CacheConfig {
  mustCache: (...vals: any[]) => boolean;

  extractArgs: (...vals: any[]) => any | undefined;

  caches: Cache[];
}

function isCacheOptions(obj: any): obj is CacheOptions {
  return typeof obj === 'object' && obj.hasOwnProperty('cacheNames');
}

export interface CacheInternalOptions {
  cacheNames: string | string[];

  /**
   * Key generator.
   * By default it is a concatenation
   */
  keyGenerator: KeyGenerator;

  key?: string;

  condition?: string;
}

export function extractCacheInternalOptions(
  value: string | string[] | CacheOptions
): CacheInternalOptions {
  const cacheNames: string[] = [];
  let keyGenerator = defaultKeyGenerator;
  let key: string | undefined;
  let condition: string | undefined;
  if (isCacheOptions(value)) {
    if (Array.isArray(value.cacheNames)) {
      cacheNames.push(...value.cacheNames);
    } else {
      cacheNames.push(value.cacheNames);
    }
    ({ key, keyGenerator = defaultKeyGenerator, condition } = value);
  } else {
    if (Array.isArray(value)) {
      cacheNames.push(...value);
    } else {
      cacheNames.push(value);
    }
  }

  return {
    cacheNames,
    key,
    keyGenerator,
    condition
  };
}

export function createCacheConfig(
  container: Container,
  cacheInternalOptions: CacheInternalOptions
): CacheConfig {
  const { cacheNames, condition, key } = cacheInternalOptions;

  let mustCache = (...vals: any[]) => true;

  if (condition !== undefined) {
    mustCache = ((e: Expression) => (...vals: any[]) => {
      try {
        const res = e.getValue<boolean>({ args: vals });
        return typeof res === 'boolean' ? res : false;
      } catch (e) {
        /* istanbul ignore next */ {
          console.log('error condition', e);
          return false;
        }
      }
    })(
      container
        .get<ExpressionParser>(ExpressionParser)
        .parseExpression(condition!)
    );
  }

  let extractArgs = (...vals: any[]) => vals;

  // if a key is passed, create a key
  if (key) {
    extractArgs = ((e: Expression) => (...vals: any[]) => {
      try {
        let extractedArgs = e.getValue<any>({ args: vals });

        if (extractedArgs) {
          extractedArgs = Array.isArray(extractedArgs)
            ? extractedArgs
            : [extractedArgs];
        }
        return extractedArgs;
      } catch (e) {
        /* istanbul ignore next */ {
          console.error('cache Error', e);
          return undefined;
        }
      }
    })(container.get<ExpressionParser>(ExpressionParser).parseExpression(key!));
  }

  const cacheManager: CacheManager = container.get<CacheManager>(CACHE_MANAGER);

  const caches: Cache[] = [];
  for (const cacheName of cacheNames) {
    const cache = cacheManager.getCache(cacheName);
    if (cache) {
      caches.push(cache);
    }
  }

  return {
    mustCache,
    extractArgs,
    caches
  };
}

function defaultKeyGenerator(...args: any[]) {
  const k = [];

  /* istanbul ignore next */
  if (args === undefined) {
    return undefined;
  }
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
