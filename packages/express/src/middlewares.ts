import { express } from './express';
import { MiddlewareConfig } from '@gabliam/rest-decorators';

export type ExpressMiddlewareConfig = MiddlewareConfig<express.Application>;
export { MiddlewareConfig };
