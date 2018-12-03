import { Config } from '@gabliam/core';
import { express } from '@gabliam/express';
import { koa } from '@gabliam/koa';
import { WebConfigAfterControllers, WebConfig } from '@gabliam/web-core/src';
import * as Boom from 'boom';

function isBoom(val: any): val is Boom<any> {
  return val && val.isBoom;
}

@Config()
export class ServerConfig {
  @WebConfig()
  addKoaConfig(app: koa) {
    if (process.env.SERVER_TYPE === 'koa') {
      console.log('register koa error');
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          if (isBoom(err)) {
            ctx.status = err.output.statusCode;
            ctx.type = 'application/json';
            ctx.body = err.output.payload;
          } else {
            throw err;
          }
        }
      });
    }
  }

  @WebConfigAfterControllers()
  addExpressErrorConfig(app: express.Application) {
    if (process.env.SERVER_TYPE !== 'koa') {
      console.log('register express error');
      app.use(<express.ErrorRequestHandler>function(err, req, res, next) {
        if (isBoom(err)) {
          res.status(err.output.statusCode).json(err.output.payload);
        } else {
          next(err);
        }
      });
    }
  }
}
