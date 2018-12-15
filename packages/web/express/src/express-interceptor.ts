import { Service } from '@gabliam/core';
import {
  Interceptor,
  InterceptorConstructor,
  UseInterceptors,
} from '@gabliam/web-core';
import { METADATA_KEY } from './constants';
import { express } from './express';

export type ExpressInterceptorType = 'RequestHandler' | 'intercept';

/**
 * Test if target is an express interceptor
 * @param target any
 */
export const isExpressInterceptor = (target: any) =>
  Reflect.hasOwnMetadata(
    METADATA_KEY.expressInterceptor,
    target.constructor || target
  );

export const getExpressInterceptorType = (
  target: any
): ExpressInterceptorType =>
  Reflect.getOwnMetadata(
    METADATA_KEY.expressInterceptor,
    target.constructor || target
  );

/**
 * ExpressInterceptor decorator
 * class is an express interceptor.
 * Must return express middleware
 */
const ExpressInterceptor = (type: ExpressInterceptorType) => (target: any) => {
  Reflect.defineMetadata(METADATA_KEY.expressInterceptor, type, target);
};

/**
 * Convert a Express middleware to an express interceptor
 */
export const toInterceptor = (
  mid: express.RequestHandler | express.ErrorRequestHandler,
  type: ExpressInterceptorType = 'RequestHandler'
): InterceptorConstructor => {
  const clazz: InterceptorConstructor = class implements Interceptor {
    intercept() {
      return mid;
    }
  };
  Service()(clazz);
  ExpressInterceptor(type)(clazz);
  return clazz;
};

/**
 * Alias for evict to use: UseInterceptors(toInterceptor(expressMid))
 * /!\ Use it for RequestHandler
 */
export const UseExpressInterceptors = (
  ...mids: (express.RequestHandler | express.ErrorRequestHandler)[]
) => UseInterceptors(...mids.map(m => toInterceptor(m)));
