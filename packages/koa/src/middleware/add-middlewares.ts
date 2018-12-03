import { ConfigFunction, WEB_PLUGIN_CONFIG } from '@gabliam/web-core';
import * as bodyParser from 'koa-body';
import { KoaConfig } from '../config';
import { koa } from '../koa';

export const addMiddlewares: ConfigFunction<koa> = (app, container) => {
  const config = container.get<KoaConfig>(WEB_PLUGIN_CONFIG);
  app.use(bodyParser(config.koaBodyOptions));
};
