/* eslint-disable no-lone-blocks */
import { Container, reflection } from '@gabliam/core';
import { Expression, ExpressionParser } from '@gabliam/expression';
import d from 'debug';
import { Cache } from '../cache';
import { CacheManager } from '../cache-manager';
import { CACHE_MANAGER } from '../constant';
import { CacheNameIsMandatoryError } from '../error';
import { CacheGroup } from './cache-group';

const debug = d('Gabliam:Plugin:CachePlugin:CacheOptions');

export type KeyGenerator = (...args: any[]) => string | undefined;

export interface CacheOptions {
  /**
   * names of caches
   */
  cacheNames?: string | string[];

  /**
   * Key generator.
   * By default it is a concatenation of all arguments (Use JSON stringify)
   */
  keyGenerator?: KeyGenerator;

  /**
   * Define what it uses to generate the key. By default, use all arguments
   * Can be an expression.
   *
   * $args can be used (represents the arguments passed to the method).
   *
   * sample: key: '$args[0].name'
   */
  key?: string;

  /**
   * Condition for caching (used before invocation of method)
   * $args can be used (represents the arguments passed to the method)
   *
   * sample : condition: '$args[0].id !== 1',
   */
  condition?: string;

  /**
   * The unless parameter can be used to veto the adding of a value to the cache.
   * Unlike condition, unless expressions are evaluated after the method has been called.
   *
   * sample : unless: '$result !== null'
   */
  unless?: string;
}

export interface CacheConfig {
  passCondition: (...vals: any[]) => boolean;

  veto: (args: any[], result: any) => boolean;

  extractArgs: (...vals: any[]) => any | undefined;

  caches: Cache[];
}

export function isCacheOptions(obj: any): obj is CacheOptions {
  return (
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, 'cacheNames')
  );
}

/**
 * Cache internal options
 */
export interface CacheInternalOptions {
  cacheNames: string | string[];

  /**
   * Key generator.
   * By default it is a concatenation of all arguments (Use JSON stringify)
   */
  keyGenerator: KeyGenerator;

  /**
   * Define what it uses to generate the key. By default, use all arguments
   * Can be an expression.
   *
   * $args can be used (represents the arguments passed to the method).
   *
   * sample: key: '$args[0].name'
   */
  key?: string;

  /**
   * Condition for caching (used before invocation of method)
   * $args can be used (represents the arguments passed to the method)
   *
   * sample : condition: '$args[0].id !== 1',
   */
  condition?: string;

  /**
   * The unless parameter can be used to veto the adding of a value to the cache.
   * Unlike condition, unless expressions are evaluated after the method has been called.
   *
   * sample : unless: '$result !== null'
   */
  unless?: string;
}

export const getCacheGroup = (target: Object) => {
  const [cacheGroup] = reflection
    .annotationsOfDecorator<CacheGroup>(target, CacheGroup)
    .slice(-1);
  return cacheGroup ? cacheGroup.cacheGroupName || 'default' : 'default';
};

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
      // eslint-disable-next-line no-empty
    } catch {}
  }
  return k.join('');
}

export function extractCacheInternalOptions(
  value?: string | string[] | CacheOptions,
): CacheInternalOptions {
  const cacheNames: string[] = [];
  let keyGenerator = defaultKeyGenerator;
  let key: string | undefined;
  let condition: string | undefined;
  let unless: string | undefined;

  if (isCacheOptions(value)) {
    if (value.cacheNames) {
      if (Array.isArray(value.cacheNames)) {
        cacheNames.push(...value.cacheNames);
      } else {
        cacheNames.push(value.cacheNames);
      }
    }
    ({ key, keyGenerator = defaultKeyGenerator, condition, unless } = value);
  } else if (value) {
    if (Array.isArray(value)) {
      cacheNames.push(...value);
    } else {
      cacheNames.push(value);
    }
  }

  if (cacheNames.length === 0) {
    throw new CacheNameIsMandatoryError();
  }

  return {
    cacheNames,
    key,
    keyGenerator,
    condition,
    unless,
  };
}

export async function createCacheConfig(
  cacheGroup: string,
  container: Container,
  cacheInternalOptions: CacheInternalOptions,
): Promise<CacheConfig> {
  const { cacheNames, condition, key, unless } = cacheInternalOptions;

  let passCondition = () => true;

  if (condition !== undefined) {
    passCondition = ((e: Expression) => (...vals: any[]) => {
      try {
        const res = e.getValue<boolean>({ args: vals });
        return typeof res === 'boolean' ? res : false;
      } catch (error) {
        /* istanbul ignore next */ {
          debug('error condition', error);
          return false;
        }
      }
    })(
      container
        .get<ExpressionParser>(ExpressionParser)
        .parseExpression(condition),
    );
  }

  let veto = (args: any[], result: any) => false;
  if (unless !== undefined) {
    veto = ((e: Expression) => (args: any[], result: any) => {
      try {
        const res = e.getValue<boolean>({ args, result });
        return typeof res === 'boolean' ? res : false;
      } catch (error) {
        /* istanbul ignore next */ {
          debug('error condition', error);
          return false;
        }
      }
    })(
      container.get<ExpressionParser>(ExpressionParser).parseExpression(unless),
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
      } catch (error) {
        /* istanbul ignore next */ {
          debug('cache Error', error);
          return undefined;
        }
      }
    })(container.get<ExpressionParser>(ExpressionParser).parseExpression(key));
  }

  const cacheManager: CacheManager = container.get<CacheManager>(CACHE_MANAGER);

  const caches: Cache[] = [];
  for (const cacheName of cacheNames) {
    // eslint-disable-next-line no-await-in-loop
    const cache = await cacheManager.getCache(cacheName, cacheGroup);
    if (cache) {
      caches.push(cache);
    }
  }

  return {
    passCondition,
    extractArgs,
    caches,
    veto,
  };
}
