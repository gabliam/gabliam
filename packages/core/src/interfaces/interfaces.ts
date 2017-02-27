import * as express from 'express';
import { interfaces } from 'inversify';


export interface ConfigFunction {
    (app: express.Application): void;
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
}


export interface GabliamPluginConstructor {
    new (app: express.Application, container: interfaces.Container): GabliamPlugin;
}


export interface GabliamPlugin {

    build?();

    bind?();

    addConfig?(): ConfigFunction;

    addErrorConfig?(): ConfigFunction;
}
