import { Config } from '@gabliam/core';
import { express } from '@gabliam/express';
import * as helmet from 'helmet';
import * as passport from 'passport';
import { WebConfig, WebConfigAfterCtl } from '@gabliam/web-core';
import * as Boom from 'boom';
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

  @WebConfigAfterCtl()
  addExpressConfigError(app: express.Application) {
    app.use(function(
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
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
