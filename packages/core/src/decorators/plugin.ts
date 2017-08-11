import { METADATA_KEY, ERRORS_MSGS } from '../constants';
import { PluginMetadata } from '../interfaces';

export interface PluginOptions {
  name?: string;

  dependencies?: string[];
}

function isPluginOptions(obj: any): obj is PluginOptions {
  return (
    typeof obj === 'object' &&
    (obj.hasOwnProperty('name') || obj.hasOwnProperty('dependencies'))
  );
}

export type PluginReturn = (target: any) => void;

/**
 * Plugin decorator
 *
 *
 * @param  {string} type type in registry
 * @param  {any} value
 */
export function Plugin(value?: string | PluginOptions): PluginReturn {
  return function(target: any) {
    if (Reflect.hasOwnMetadata(METADATA_KEY.plugin, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_PLUGIN_DECORATOR);
    }

    let name = target.name;
    let dependencies: string[] = [];

    if (value) {
      if (typeof value === 'string') {
        name = value;
      } else if (isPluginOptions(value)) {
        name = value.name ? value.name : name;
        dependencies = value.dependencies ? value.dependencies : dependencies;
      } else {
        throw new Error(ERRORS_MSGS.INVALID_PLUGIN_DECORATOR);
      }
    }

    Reflect.defineMetadata(
      METADATA_KEY.plugin,
      <PluginMetadata>{ name, dependencies },
      target
    );
    return target;
  };
}
