import { Config } from '@gabliam/core';
import { ExpressConfig } from '@gabliam/express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';

@Config(200)
export class ServerConfig {
  @ExpressConfig()
  addExpressConfig(app: express.Application) {
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    app.use(bodyParser.json());
    app.use(helmet());
  }
}
