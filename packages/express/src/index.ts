import { APP, SERVER } from './constants';
import * as interfaces from './interfaces';
import { MiddlewareConfig } from './middlewares';
import { ExpressPlugin } from './expressPlugin';

export * from './decorators';
export {
  interfaces,
  APP,
  SERVER,
  MiddlewareConfig,
  ExpressPlugin as default
};
