import { ConfigFunction, GabContext, Cookie } from '@gabliam/web-core';
import { express } from '../express';
import { ExpressRequest } from '../request';
import { ExpressResponse } from '../response';
import { CONTEXT } from '../constants';

export const addContextMiddleware: ConfigFunction<
  express.Application
> = app => {
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const context = new GabContext(
        new ExpressRequest(req),
        new ExpressResponse(res),
        new Cookie(req, res)
      );

      (req as any)[CONTEXT] = context;
      next();
    }
  );
};
