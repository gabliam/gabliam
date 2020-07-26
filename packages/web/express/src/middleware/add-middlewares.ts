import { ConfigFunction } from '@gabliam/web-core';
import bodyParser from 'body-parser';
import { ExpressConfig } from '../config';
import { EXPRESS_PLUGIN_CONFIG } from '../constants';
import { express } from '../express';

export const addMiddlewares: ConfigFunction<express.Application> = (
  app,
  container
) => {
  const config = container.get<ExpressConfig>(EXPRESS_PLUGIN_CONFIG);
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
