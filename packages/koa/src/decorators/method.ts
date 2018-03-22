import { koaRouter } from '../koa';
import {
  RestParamDecorator,
  createMethodDecorator,
  RestMethodDecorator,
  MiddlewareMetadata
} from '@gabliam/web-core';

export const All: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('all');

export const Get: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('get');

export const Post: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('post');

export const Put: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('put');

export const Patch: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('patch');

export const Head: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('head');

export const Delete: RestParamDecorator<
  koaRouter.IMiddleware
> = createMethodDecorator('delete');

export const Method: RestMethodDecorator<koaRouter.IMiddleware> = (
  method: string,
  path: string,
  ...middlewares: MiddlewareMetadata<koaRouter.IMiddleware>[]
) => {
  return createMethodDecorator(method)(path, ...middlewares);
};
