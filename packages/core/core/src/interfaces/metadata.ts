import { interfaces } from 'inversify';
import { GabliamPluginConstructor } from './interfaces';

/**
 * Represents a value in the registry
 */
export interface ValueRegistry<T = any> {
  id: interfaces.ServiceIdentifier<any>;

  target: any;

  options?: T;
}

/**
 * Config registry
 */
export interface ConfigRegistry {
  order: number;
}

export interface PreDestroyRegistry {
  preDestroys: Array<string | symbol>;
}

/**
 * Plugin dependency
 */
export interface PluginDependency {
  name: string | GabliamPluginConstructor;

  order: 'before' | 'after';
}
