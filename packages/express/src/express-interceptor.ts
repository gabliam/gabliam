import {
  AfterResponseInterceptor,
  Interceptor,
  InterceptorMethod,
} from '@gabliam/web-core';
import { METADATA_KEY } from './constants';
import { express } from './express';
import { Service } from '@gabliam/core';

export const isExpressInterceptor = (target: any) =>
  Reflect.getOwnMetadata(
    METADATA_KEY.expressInterceptor,
    target.constructor || target
  ) === true;

const ExpressInterceptor = () => (target: any) => {
  Reflect.defineMetadata(METADATA_KEY.expressInterceptor, true, target);
};

export type InterceptorConstructor =
  | { new (): Interceptor }
  | { new (): AfterResponseInterceptor };

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
