import { toPromise } from '@gabliam/core';
import {
  ExecutionContext,
  extractParameters,
  getContext,
  Interceptor,
  InterceptorInfo,
} from '@gabliam/web-core';
import { express } from './express';
import { getExpressInterceptorType } from './express-interceptor';

export const validatorInterceptorToMiddleware = async (
  execCtx: ExecutionContext,
  { instance, paramList }: InterceptorInfo<Interceptor>
): Promise<express.RequestHandler> => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const args = extractParameters(
      instance,
      'intercept',
      execCtx,
      getContext(req),
      next,
      paramList
    );

    try {
      await toPromise(instance.intercept(...args));
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const convertExpressInterceptorToMiddleware = async (
  expressInterceptors: InterceptorInfo<Interceptor>[]
) => {
  const requestHandlers: express.RequestHandler[] = [];
  const errorRequestHandler: express.ErrorRequestHandler[] = [];
  for (const { instance } of expressInterceptors) {
    const type = getExpressInterceptorType(instance);
    if (type === 'RequestHandler') {
      const res = await toPromise<
        express.RequestHandler | express.RequestHandler[]
      >(instance['intercept']());

      if (res === undefined) {
        continue;
      }

      if (!Array.isArray(res)) {
        requestHandlers.push(res);
      } else {
        requestHandlers.push(...res);
      }
    } else {
      const res = await toPromise<
        express.ErrorRequestHandler | express.ErrorRequestHandler[]
      >(instance['intercept']());

      if (res === undefined) {
        continue;
      }

      if (!Array.isArray(res)) {
        errorRequestHandler.unshift(res);
      } else {
        errorRequestHandler.unshift(...res);
      }
    }
  }

  return {
    requestHandlers,
    errorRequestHandler,
  };
};
