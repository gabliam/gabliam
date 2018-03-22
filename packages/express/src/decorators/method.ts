import { express } from '../express';
import {
  RestParamDecorator,
  createMethodDecorator,
  RestMethodDecorator,
  MiddlewareMetadata
} from '@gabliam/web-core';

export const All: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('all');

export const Get: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('get');

export const Post: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('post');

export const Put: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('put');

export const Patch: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('patch');

export const Head: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('head');

export const Delete: RestParamDecorator<
  express.RequestHandler
> = createMethodDecorator('delete');

export const Method: RestMethodDecorator<express.RequestHandler> = (
  method: string,
  path: string,
  ...middlewares: MiddlewareMetadata<express.RequestHandler>[]
) => {
  return createMethodDecorator(method)(path, ...middlewares);
};
