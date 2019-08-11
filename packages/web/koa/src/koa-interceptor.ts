import { Service } from '@gabliam/core';
import {
  Context,
  GabContext,
  Interceptor,
  InterceptorConstructor,
  METADATA_KEY,
  Next,
  UseInterceptors,
  nextFn,
} from '@gabliam/web-core';
import { koaRouter } from './koa';

/**
 * Test if target is a valid interceptor
 * @param target any
 */
export const isValidInterceptor = (target: any) => {
  const meta = Reflect.getOwnMetadata(
    METADATA_KEY.specialInterceptor,
    target.constructor || target
  );

  return meta === undefined || meta === 'koa';
};

/**
 * KoaInterceptor decorator
 * class is an koa interceptor.
 * Must return koaRouter middleware
 */
const KoaInterceptor = () => (target: any) => {
  Reflect.defineMetadata(METADATA_KEY.specialInterceptor, 'koa', target);
};

/**
 * Convert a Koa router middleware to a gabliam interceptor
 */
export const toInterceptor = (
  mid: koaRouter.IMiddleware
): InterceptorConstructor => {
  const clazz: InterceptorConstructor = class implements Interceptor {
    async intercept(context: GabContext, next: nextFn) {
      const ctx: koaRouter.IRouterContext = context.state.context;
      return await mid(ctx, next);
    }
  };
  Context()(clazz.prototype, 'intercept', 0);
  Next()(clazz.prototype, 'intercept', 1);
  Service()(clazz);
  KoaInterceptor()(clazz);

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
 * Alias for evict to use: UseInterceptors(toInterceptor(koaMid))
 */
export const UseKoaInterceptors = (...mids: koaRouter.IMiddleware[]) =>
  UseInterceptors(...mids.map(m => toInterceptor(m)));
