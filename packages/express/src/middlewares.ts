import { express } from './express';
import { MiddlewareConfig } from '@gabliam/web-core';

export type ExpressMiddlewareConfig = MiddlewareConfig<express.Application>;
export { MiddlewareConfig };
