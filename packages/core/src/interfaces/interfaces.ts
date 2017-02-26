import * as express from 'express';
import { interfaces } from 'inversify';
import { Registry } from '../registry';


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


export interface GabliamPlugin {

    build?(app: express.Application, registry: Registry, container: interfaces.Container);

    bind?(registry: Registry, container: interfaces.Container);

    addConfig?(): ConfigFunction;

    addErrorConfig?(): ConfigFunction;
}
