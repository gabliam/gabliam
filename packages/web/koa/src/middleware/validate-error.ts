import {
  ConfigFunction,
  isValidateError,
  getValidateError,
} from '@gabliam/web-core';
import { koa } from '../koa';

export const valideErrorMiddleware: ConfigFunction<koa> = app => {
  app.use(async (ctx: koa.Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (err) {
      if (isValidateError(err)) {
        if (ctx.state.jsonHandler) {
          ctx.type = 'application/json';
        }
        ctx.status = 400;
        ctx.body = getValidateError(err);
      } else {
        throw err;
      }
    }
  });
};
