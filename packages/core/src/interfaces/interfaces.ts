import * as express from 'express';
import { interfaces } from 'inversify';
import { Registry } from '../registry';


export interface ConfigFunction {
    (app: express.Application): void;
}

export interface Config { }

export interface GabliamConfig {
    discoverPath: string;
    configPath?: string;
    customRouter?: express.Router;
}


export interface GabliamPluginConstructor {
    new (): GabliamPlugin;
}


export interface GabliamPlugin {

    build?(app: express.Application, container: interfaces.Container, registry: Registry): void;

    bind?(app: express.Application, container: interfaces.Container, registry: Registry): void;

    addConfig?(app: express.Application, container: interfaces.Container, registry: Registry): ConfigFunction;

    addErrorConfig?(app: express.Application, container: interfaces.Container, registry: Registry): ConfigFunction;

    destroy(): Promise<void>;
}
