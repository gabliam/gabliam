import { MiddlewareConfig } from '@gabliam/rest-decorators';
import { koa } from './koa';

export type KoaMiddlewareConfig = MiddlewareConfig<koa>;
export { MiddlewareConfig };
