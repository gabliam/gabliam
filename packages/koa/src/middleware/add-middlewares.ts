import { ConfigFunction, WEB_PLUGIN_CONFIG } from '@gabliam/web-core';
import { koa } from '../koa';
import * as bodyParser from 'koa-body';
import { KoaConfig } from '../config';

export const addMiddlewares: ConfigFunction<koa> = (app, container) => {
  const config = container.get<KoaConfig>(WEB_PLUGIN_CONFIG);
  app.use(bodyParser(config.koaBodyOptions));
};
