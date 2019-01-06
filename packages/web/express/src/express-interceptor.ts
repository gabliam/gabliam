import { Service } from '@gabliam/core';
import {
  Interceptor,
  InterceptorConstructor,
  UseInterceptors,
  METADATA_KEY,
  GabContext,
  Context,
  Next,
  nextFn,
} from '@gabliam/web-core';
import { express } from './express';

export type ExpressInterceptorType = 'RequestHandler' | 'intercept';

/**
 * Test if target is an express interceptor
 * @param target any
 */
export const isValidInterceptor = (target: any) => {
  const meta = Reflect.getOwnMetadata(
    METADATA_KEY.specialInterceptor,
    target.constructor || target
  );

  return meta === undefined || meta === 'express';
};

/**
 * ExpressInterceptor decorator
 * class is an express interceptor.
 * Must return express middleware
 */
const ExpressInterceptor = () => (target: any) => {
  Reflect.defineMetadata(METADATA_KEY.specialInterceptor, 'express', target);
};

/**
 * Convert a Express middleware to an express interceptor
 */
export const toInterceptor = (
  mid: express.RequestHandler
): InterceptorConstructor => {
  const clazz: InterceptorConstructor = class implements Interceptor {
    async intercept(context: GabContext, next: nextFn) {
      const req = context.request.originalRequest;
      const res = context.response.originalResponse;
      switch (mid.length) {
        // with callback
        case 3:
          return new Promise((resolve, reject) => {
            (<express.RequestHandler>mid)(req, res, err => {
              if (err) {
                reject(err);
              } else {
                resolve(next());
              }
            });
          });
        // with error
        case 2:
        default:
          (<any>mid)(req, res);
          await next();
      }
    }
  };
  Context()(clazz.prototype, 'intercept', 0);
  Next()(clazz.prototype, 'intercept', 1);
  Service()(clazz);
  ExpressInterceptor()(clazz);

  // metadata
  Reflect.defineMetadata('design:type', Function, clazz.prototype, 'intercept');
  Reflect.defineMetadata(
    'design:paramtypes',
    [Function, Function],
    clazz.prototype,
    'intercept'
  );
  Reflect.defineMetadata(
    'design:returntype',
    Promise,
    clazz.prototype,
    'intercept'
  );
  return clazz;
};

/**
 * Alias for evict to use: UseInterceptors(toInterceptor(expressMid))
 * /!\ Use it for RequestHandler
 */
export const UseExpressInterceptors = (...mids: express.RequestHandler[]) =>
  UseInterceptors(...mids.map(m => toInterceptor(m)));
