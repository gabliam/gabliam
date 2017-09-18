import { interfaces } from 'inversify';
import { Registry } from '../registry';
import { ValueValidator, PluginMetadata } from './metadata';

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
  configPath: string;
}

/**
 * Interface of plugin constructor
 */
export interface GabliamPluginConstructor {
  new (): GabliamPlugin;
}

export interface GabliamPluginDefinition extends PluginMetadata {
  plugin: GabliamPlugin;
}

/**
 * Interface for a plugin
 */
export interface GabliamPlugin {
  build?(
    container: interfaces.Container,
    registry: Registry
  ): void | Promise<void>;

  bind?(
    container: interfaces.Container,
    registry: Registry
  ): void | Promise<void>;

  config?(
    container: interfaces.Container,
    registry: Registry,
    confInstance: any
  ): void | Promise<void>;

  start?(container: interfaces.Container, registry: Registry): Promise<void>;

  stop?(container: interfaces.Container, registry: Registry): Promise<void>;

  destroy?(container: interfaces.Container, registry: Registry): Promise<void>;
}

export type ValueExtractor = (
  path: string,
  defaultValue: any,
  validator?: ValueValidator | null
) => any;
