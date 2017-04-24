import * as express from 'express';
import { interfaces } from '@gabliam/core';

export interface Controller { }

export interface HandlerDecorator {
    (target: any, key: string, value: any): void;
}

export interface ExpressPluginConfig {
    rootPath: string;

    port: number;

    hostname: string;
}

export interface MiddlewareConfigurator {
    (...values: any[]):  express.RequestHandler | express.RequestHandler[];
}

export interface MiddlewareDefinition {
    name: string;

    values: any[];
}

/**
 * Config function
 */
export interface ConfigFunction {
    (app: express.Application): void;
}

export interface ExpressConfigRegistry extends interfaces.ValueRegistry {
    key: string;
}
