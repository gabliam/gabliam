import { interfaces } from 'inversify';

/**
 * Represents a value in the registry
 */
export interface ValueRegistry<T = any> {
  id: interfaces.ServiceIdentifier<any>;

  target: any;

  options?: T;

  autoBind: boolean;
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
