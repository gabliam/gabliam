import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  Service,
  toPromise,
} from '@gabliam/core';
import {
  createInterceptorResolver,
  extractParameters,
  getParameterMetadata,
  isInterceptor,
  InterceptorMethod,
  Interceptor,
  AfterResponseInterceptor,
} from '@gabliam/web-core';
import { express } from './express';
import { getContext } from './utils';
import { METADATA_KEY } from './constants';

@InjectContainer()
@Service()
export class ExpressConverter {
  public interceptorToMiddleware(clazz: any): express.RequestHandler {
    const container = <Container>(this as any)[INJECT_CONTAINER_KEY];
    const instance = createInterceptorResolver(container)(clazz);
    if (!isInterceptor(instance)) {
      throw new Error();
    }

    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const args = extractParameters(
        instance,
        'intercept',
        null,
        getContext(req),
        next,
        getParameterMetadata(instance, 'intercept')
      );

      try {
        await toPromise((instance['intercept'] as any)(...args));
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}

export const isExpressInterceptor = (target: any) =>
  Reflect.getOwnMetadata(METADATA_KEY.expressInterceptor, target) === true;

const addExpressInterceptorMetadata = (target: any) => {
  Reflect.defineMetadata(METADATA_KEY.expressInterceptor, true, target);
};

export const middlewareToInterceptor = (
  mid: express.RequestHandler | express.ErrorRequestHandler,
  type: InterceptorMethod
) => {
  if (type === 'intercept') {
    const clazz = class implements Interceptor {
      intercept() {
        return mid;
      }
    };
    addExpressInterceptorMetadata(clazz);
    return clazz;
  } else {
    const clazz = class implements AfterResponseInterceptor {
      afterResponse() {
        return mid;
      }
    };
    addExpressInterceptorMetadata(clazz);
    return clazz;
  }
};
