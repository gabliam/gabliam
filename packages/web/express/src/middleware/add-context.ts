import {
  ConfigFunction,
  Cookie,
  GabContext,
  setContext,
} from '@gabliam/web-core';
import { express } from '../express';
import { ExpressRequest } from '../request';
import { ExpressResponse } from '../response';

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

      setContext(req, context);
      next();
    }
  );
};
