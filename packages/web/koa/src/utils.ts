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
