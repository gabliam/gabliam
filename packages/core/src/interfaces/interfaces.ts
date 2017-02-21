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

export interface DecoratorRegistry {
    id: interfaces.ServiceIdentifier<any>;

    target: any;
}

export interface ConfigRegistry extends DecoratorRegistry {
    order: number;
}

export interface GabliamConfig {
    discoverPath: string;
    configPath?: string;
    customRouter?: express.Router;
    routingConfig?: RoutingConfig;
}
