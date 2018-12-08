import {
  AfterResponseInterceptor,
  Interceptor,
  InterceptorMethod,
  InterceptorConstructor,
  UseInterceptors,
} from '@gabliam/web-core';
import { METADATA_KEY } from './constants';
import { express } from './express';
import { Service } from '@gabliam/core';

/**
 * Test if target is an express interceptor
 * @param target any
 */
export const isExpressInterceptor = (target: any) =>
  Reflect.getOwnMetadata(
    METADATA_KEY.expressInterceptor,
    target.constructor || target
  ) === true;

/**
 * ExpressInterceptor decorator
 * class is an express interceptor.
 * Must return express middleware
 */
const ExpressInterceptor = () => (target: any) => {
  Reflect.defineMetadata(METADATA_KEY.expressInterceptor, true, target);
};

/**
 * Convert a Express middleware to an express interceptor
 */
export const toInterceptor = (
  mid: express.RequestHandler | express.ErrorRequestHandler,
  type: InterceptorMethod = 'intercept'
): InterceptorConstructor => {
  let clazz: InterceptorConstructor;
  if (type === 'intercept') {
    clazz = class implements Interceptor {
      intercept() {
        return mid;
      }
    };
  } else {
    clazz = class implements AfterResponseInterceptor {
      afterResponse() {
        return mid;
      }
    };
  }
  Service()(clazz);
  ExpressInterceptor()(clazz);
  return clazz;
};

/**
 * Alias for evict to use: UseInterceptors(toInterceptor(expressMid))
 */
export const UseExpressInterceptors = (
  ...mids: (express.RequestHandler | express.ErrorRequestHandler)[]
) => UseInterceptors(...mids.map(m => toInterceptor(m)));
