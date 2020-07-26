import { ConfigFunction } from '@gabliam/web-core';
import bodyParser from 'koa-body';
import { KoaConfig } from '../config';
import { KOA_PLUGIN_CONFIG } from '../constants';
import { koa } from '../koa';

export const addMiddlewares: ConfigFunction<koa> = (app, container) => {
  const config = container.get<KoaConfig>(KOA_PLUGIN_CONFIG);
  // @ts-ignore bad definition
  app.use(bodyParser(config.koaBodyOptions));
};
