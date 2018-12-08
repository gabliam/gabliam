import { ConfigFunction, WEB_PLUGIN_CONFIG } from '@gabliam/web-core';
import { express } from '../express';
import * as bodyParser from 'body-parser';
import { ExpressConfig } from '../config';

export const addMiddlewares: ConfigFunction<express.Application> = (
  app,
  container
) => {
  const config = container.get<ExpressConfig>(WEB_PLUGIN_CONFIG);
  app.disable('x-powered-by');
  if (config.bodyParser.json) {
    app.use(bodyParser.json(config.bodyParser.optionsJson));
  }

  if (config.bodyParser.urlencoded) {
    app.use(bodyParser.json(config.bodyParser.optionsUrlencoded));
  }

  if (config.bodyParser.text) {
    app.use(bodyParser.json(config.bodyParser.optionsText));
  }
};
