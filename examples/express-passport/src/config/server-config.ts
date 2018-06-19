import { Config } from '@gabliam/core';
import { ExpressConfig, express } from '@gabliam/express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as passport from 'passport';

@Config(152)
export class ServerConfig {
  @ExpressConfig()
  addExpressConfig(app: express.Application) {
    // init session
    app.use(
      require('express-session')({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false
      })
    );
    // add body parser
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    app.use(bodyParser.json());

    // add helmet for security
    app.use(helmet());

    // init passport
    app.use(passport.initialize());
    app.use(passport.session());
  }
}
