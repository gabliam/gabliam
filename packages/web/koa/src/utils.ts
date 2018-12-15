import {
  ExecutionContext,
  InterceptorInfo,
  Interceptor,
  extractParameters,
  getContext,
} from '@gabliam/web-core';
import { koaRouter, koa } from './koa';
import { toPromise } from '@gabliam/core/src';

export const validatorInterceptorToMiddleware = async (
  execCtx: ExecutionContext,
  { instance, paramList }: InterceptorInfo<Interceptor>
): Promise<koaRouter.IMiddleware> => {
  return async (context: koa.Context, next: () => Promise<any>) => {
    const args = extractParameters(
      instance,
      'intercept',
      execCtx,
      getContext(context.req),
      next,
      paramList
    );

    await toPromise(instance.intercept(...args));
    await next();
  };
};

export const convertKoaInterceptorToMiddleware = async (
  koaInterceptors: InterceptorInfo<Interceptor>[]
) => {
  const koaMiddlewares: koaRouter.IMiddleware[] = [];
  for (const { instance } of koaInterceptors) {
    const res = await toPromise<
      koaRouter.IMiddleware | koaRouter.IMiddleware[]
    >(instance['intercept']());

    if (res === undefined) {
      continue;
    }

    if (!Array.isArray(res)) {
      koaMiddlewares.push(res);
    } else {
      koaMiddlewares.push(...res);
    }
  }

  return koaMiddlewares;
};
