import { ERRORS_MSGS, METADATA_KEY } from '../constants';
import { makeDecorator, TypeDecorator } from '../decorator';
import { GabliamPluginConstructor, PluginDependency } from '../interfaces';

/**
 * Type of the `Plugin` decorator / constructor function.
 */
export interface PluginDecorator {
  /**
   * Decorator that marks a class as an Gabliam Plugin and provides configuration
   * metadata that determines how the config should be processed,
   * instantiated.
   *
   * @usageNotes
   *
   * Here is an example of a class that define a Plugin without dependencies
   *
   * ```typescript
   *  @Plugin()
   *  export class Plugin {}
   * ```
   */
  (value?: string | PluginOptions): TypeDecorator;

  /**
   * see the `@OnMissingBean` decorator.
   */
  new (value?: string | PluginOptions): any;
}

/**
 * Plugin options for decorator
 */
export interface PluginOptions {
  /**
   * Define the name of the plugin.
   * default: class.name
   */
  name?: string;

  /**
   * Define the dependencies.
   */
  dependencies?: (PluginDependency | string | GabliamPluginConstructor)[];
}

/**
 * `Plugin` decorator and metadata.
 */
export interface Plugin {
  /**
   * Define the name of the plugin
   * default: class.name
   */
  name?: string;

  /**
   * Define the dependencies
   */
  dependencies: PluginDependency[];
}

function isPluginDependency(obj: any): obj is PluginDependency {
  return (
    typeof obj === 'object' &&
    (obj.hasOwnProperty('name') || obj.hasOwnProperty('order'))
  );
}

function isPluginOptions(obj: any): obj is PluginOptions {
  return (
    typeof obj === 'object' &&
    (obj.hasOwnProperty('name') || obj.hasOwnProperty('dependencies'))
  );
}

export const Plugin: PluginDecorator = makeDecorator(
  METADATA_KEY.plugin,
  (value?: string | PluginOptions): Plugin => {
    let name: string | undefined;
    const dependencies: PluginDependency[] = [];
    if (value) {
      if (typeof value === 'string') {
        name = value;
      } else if (isPluginOptions(value)) {
        name = value.name ? value.name : name;
        if (value.dependencies) {
          value.dependencies.forEach(dep => {
            if (isPluginDependency(dep)) {
              dependencies.push(dep);
            } else {
              dependencies.push({ name: dep, order: 'after' });
            }
          });
        }
      } else {
        throw new Error(ERRORS_MSGS.INVALID_PLUGIN_DECORATOR);
      }
    }

    return { name, dependencies };
  }
);
