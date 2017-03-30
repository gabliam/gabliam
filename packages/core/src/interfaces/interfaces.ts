import * as express from 'express';
import { interfaces } from 'inversify';
import { Registry } from '../registry';

/**
 * Config function
 */
export interface ConfigFunction {
    (app: express.Application): void;
}

/**
 * Config interface
 */
export interface Config { }

/**
 * Config for gabliam
 */
export interface GabliamConfig {
    /**
     * Path to scan
     */
    scanPath: string;

    /**
     * Path of config
     */
    configPath?: string;

    /**
     * customRouter
     */
    customRouter?: express.Router;
}

/**
 * Interface of plugin constructor
 */
export interface GabliamPluginConstructor {
    new (): GabliamPlugin;
}

/**
 * Interace for a plugin
 */
export interface GabliamPlugin {

    build?(app: express.Application, container: interfaces.Container, registry: Registry): void;

    bind?(app: express.Application, container: interfaces.Container, registry: Registry): void;

    addConfig?(app: express.Application, container: interfaces.Container, registry: Registry): ConfigFunction;

    addErrorConfig?(app: express.Application, container: interfaces.Container, registry: Registry): ConfigFunction;

    destroy(app: express.Application, container: interfaces.Container, registry: Registry): Promise<void>;
}
