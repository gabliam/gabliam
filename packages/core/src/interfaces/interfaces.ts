import { Registry } from '../registry';
import { ValueValidator, PluginMetadata } from './metadata';
import { Container } from '../container';
import { LoaderConfigOptions } from '../loaders';

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
  config: string | LoaderConfigOptions[];
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
  build?(container: Container, registry: Registry): void | Promise<void>;

  bind?(container: Container, registry: Registry): void | Promise<void>;

  config?(
    container: Container,
    registry: Registry,
    confInstance: any
  ): void | Promise<void>;

  start?(container: Container, registry: Registry): Promise<void>;

  stop?(container: Container, registry: Registry): Promise<void>;

  destroy?(container: Container, registry: Registry): Promise<void>;
}

/**
 * Value extractor
 */
export type ValueExtractor = (
  path: string,
  defaultValue: any,
  validator?: ValueValidator | null
) => any;
