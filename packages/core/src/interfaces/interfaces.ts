import { interfaces } from 'inversify';
import { Registry } from '../registry';

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

    build?(container: interfaces.Container, registry: Registry): void;

    bind?(container: interfaces.Container, registry: Registry): void;

    config?(container: interfaces.Container, registry: Registry, confInstance: any): void;

    start?(container: interfaces.Container, registry: Registry): Promise<void>;

    stop?(container: interfaces.Container, registry: Registry): Promise<void>;

    destroy?(container: interfaces.Container, registry: Registry): Promise<void>;
}
