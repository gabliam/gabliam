import * as caller from 'caller';
import * as _ from 'lodash';
import { dirname } from 'path';
import { ERRORS_MSGS, METADATA_KEY, TYPE } from '../constants';
import { makeDecorator } from '../decorator';
import { getGabliamConfig } from '../gabliam-options';
import { GabliamAddPlugin, GabliamConfig } from '../interfaces';
import { resolvePath } from './path-utils';
import { Register } from './register';

/**
 * Type of the `Application` decorator / constructor function.
 */
export interface ApplicationDecorator {
  /**
   * Decorator  for the start application.
   *
   * @usageNotes
   *
   * ```typescript
   * @Application()
   * class SampleConfig {
   * }
   * ```
   */
  (options?: ApplicationOptions): ClassDecorator;
  new (options?: ApplicationOptions): any;
}

export interface ApplicationOptions extends Partial<GabliamConfig> {
  name?: string;

  plugins?: (GabliamAddPlugin | GabliamAddPluginCondition)[];
}

export type ConfitionFn = () => boolean | Promise<boolean>;

export interface GabliamAddPluginCondition {
  plugin: GabliamAddPlugin | string;

  /**
   * By default condition is true
   */
  condition: ConfitionFn;
}

/**
 * `Application` decorator and metadata.
 */
export interface Application extends GabliamConfig {
  name?: string;

  plugins: GabliamAddPluginCondition[];

  gabliamConfig: GabliamConfig;
}

const isGabliamAddPluginCondition = (
  val: any
): val is GabliamAddPluginCondition => {
  return val && typeof val === 'object' && val.hasOwnProperty('condition');
};

export const Application: ApplicationDecorator = makeDecorator(
  METADATA_KEY.application,
  (options?: ApplicationOptions): Application => {
    const gabliamConfig = getGabliamConfig(options);
    const fileDir = dirname(caller(4));
    if (gabliamConfig.scanPath) {
      gabliamConfig.scanPath = resolvePath(gabliamConfig.scanPath, fileDir);
    }

    if (_.isString(gabliamConfig.config)) {
      gabliamConfig.config = resolvePath(gabliamConfig.config, fileDir);
    }

    const plugins: GabliamAddPluginCondition[] = [];
    if (options?.plugins && Array.isArray(options?.plugins)) {
      plugins.push(
        ...options.plugins.map<GabliamAddPluginCondition>(p => {
          if (isGabliamAddPluginCondition(p)) {
            return p;
          }

          return {
            plugin: p,
            condition: () => true,
          };
        })
      );
    }

    return {
      gabliamConfig,
      name: options?.name,
      plugins,
    };
  },
  cls => {
    Register({ type: TYPE.Application, id: cls, autobind: false })(cls);
  },
  true,
  ERRORS_MSGS.DUPLICATED_APPLICATION_DECORATOR
);
