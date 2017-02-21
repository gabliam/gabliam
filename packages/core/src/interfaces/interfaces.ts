import * as express from 'express';
import { interfaces } from 'inversify';


export interface Controller { }

export interface HandlerDecorator {
    (target: any, key: string, value: any): void;
}

export interface ConfigFunction {
    (app: express.Application): void;
}

export interface RoutingConfig {
    rootPath: string;
}

export interface PluginDescriptor {
    discoverPath: string;
}

export interface Config { }

export interface ConfigRegistry {
    order: number;
    id: interfaces.ServiceIdentifier<any>;
}

export interface GabliamConfig {
    discoverPath: string;
    configPath?: string;
    customRouter?: express.Router;
    routingConfig?: RoutingConfig;
}
