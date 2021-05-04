/* eslint-disable @typescript-eslint/no-redeclare */
import { ERRORS_MSGS, METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';
import { GabliamPluginConstructor, PluginDependency } from '../interfaces';
import { InvalidPluginDecoratorError } from '../errors';

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
  (value?: string | PluginOptions, beforeAll?: boolean): ClassDecorator;

  new (value?: string | PluginOptions, beforeAll?: boolean): any;
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

  beforeAll: boolean;
}

function isPluginDependency(obj: any): obj is PluginDependency {
  return (
    typeof obj === 'object' &&
    (Object.prototype.hasOwnProperty.call(obj, 'name') ||
      Object.prototype.hasOwnProperty.call(obj, 'order'))
  );
}

function isPluginOptions(obj: any): obj is PluginOptions {
  return (
    typeof obj === 'object' &&
    (Object.prototype.hasOwnProperty.call(obj, 'name') ||
      Object.prototype.hasOwnProperty.call(obj, 'dependencies'))
  );
}

export const Plugin: PluginDecorator = makeDecorator(
  METADATA_KEY.plugin,
  (value?: string | PluginOptions, beforeAll = false): Plugin => {
    let name: string | undefined;
    const dependencies: PluginDependency[] = [];
    if (value) {
      if (typeof value === 'string') {
        name = value;
      } else if (isPluginOptions(value)) {
        name = value.name ? value.name : name;
        if (value.dependencies) {
          value.dependencies.forEach((dep) => {
            if (isPluginDependency(dep)) {
              dependencies.push(dep);
            } else {
              dependencies.push({ name: dep, order: 'after' });
            }
          });
        }
      } else {
        throw new InvalidPluginDecoratorError();
      }
    }

    return { name, dependencies, beforeAll };
  },
  undefined,
  true,
  ERRORS_MSGS.DUPLICATED_PLUGIN_DECORATOR,
);
