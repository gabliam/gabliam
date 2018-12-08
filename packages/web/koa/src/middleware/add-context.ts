import {
  ConfigFunction,
  Cookie,
  GabContext,
  setContext,
} from '@gabliam/web-core';
import { koa } from '../koa';
import { KoaRequest } from '../request';
import { KoaResponse } from '../response';

export const addContextMiddleware: ConfigFunction<koa> = app => {
  app.use(async (context: koa.Context, next: () => Promise<any>) => {
    const { request, response, req, res } = context;
    const gabContext = new GabContext(
      new KoaRequest(context, request),
      new KoaResponse(context, response),
      new Cookie(req, res)
    );

    setContext(req, gabContext);
    await next();
  });
};
