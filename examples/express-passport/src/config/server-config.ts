/* eslint-disable @typescript-eslint/no-var-requires */
import { Config } from '@gabliam/core';
import { express } from '@gabliam/express';
import helmet from 'helmet';
import passport from 'passport';
import { WebConfig, WebConfigAfterControllers } from '@gabliam/web-core';
import Boom from 'boom';

const AuthenticationError = require('passport/lib/errors/authenticationerror');

function isBoom(val: any): val is Boom<any> {
  return val && val.isBoom;
}

@Config(152)
export class ServerConfig {
  @WebConfig()
  addExpressConfig(app: express.Application) {
    // init session
    app.use(
      // eslint-disable-next-line global-require
      require('express-session')({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
      })
    );

    // add helmet for security
    app.use(helmet());

    // init passport
    app.use(passport.initialize());
    app.use(passport.session());
  }

  @WebConfigAfterControllers()
  addExpressConfigError(app: express.Application) {
    app.use((
      err: any,
      _: express.Request,
      res: express.Response,
      next: express.NextFunction
    // eslint-disable-next-line consistent-return
    ) => {
      let error = err;
      if (err instanceof AuthenticationError) {
        error = Boom.boomify(err, {
          statusCode: err.status,
          message: err.message,
        });
      }

      if (isBoom(error)) {
        const statusCode = error.output.statusCode;
        const payload = error.output.payload;
        return res.status(statusCode).json(payload);
      }
      next(error);
    });
  }
}
