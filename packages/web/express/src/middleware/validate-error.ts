import {
  ConfigFunction,
  isValidateError,
  getValidateError,
} from '@gabliam/web-core';
import { express } from '../express';

export const valideErrorMiddleware: ConfigFunction<
  express.Application
> = app => {
  app.use(
    (err: any, req: any, res: express.Response, next: express.NextFunction) => {
      if (isValidateError(err)) {
        if (req.jsonHandler) {
          return res.status(400).json(getValidateError(err));
        } else {
          return res.status(400).send(getValidateError(err));
        }
      }

      // If this isn't a Valide error, send it to the next error handler
      return next(err);
    }
  );
};
