/* eslint-disable @typescript-eslint/no-redeclare */
import { injectable } from 'inversify';
import { Type } from '../common';
import { ERRORS_MSGS, METADATA_KEY, ORDER_CONFIG, TYPE } from '../constants';
import { makeDecorator } from '../decorator';
import { Register } from './register';

/**
 * Type of the `Config` decorator / constructor function.
 */
export interface ConfigDecorator {
  /**
   * Decorator that marks a class as an Gabliam config and provides configuration
   * metadata that determines how the config should be processed,
   * instantiated.
   *
   * This class is loaded by the framework in config phase and all beans are injected in the container
   *
   * order of loading: CoreConfig -> PluginConfig -> Config
   *
   * @usageNotes
   *
   * Here is an example of a class that define a config
   *
   * ```typescript
   *  class Gretter {
   *      constructor(private name:string){};
   *      greet() {
   *          return `Hello ${this.name} !`;
   *      }
   *  }
   *
   * @Config()
   * class SampleConfig {
   *      @Bean(Gretter)
   *      createGretter() {
   *          return new Gretter('David');
   *      }
   * }
   * ```
   */
  (order?: number): ClassDecorator;

  /**
   * see the `@Config` decorator.
   */
  new (order?: number): any;
}

/**
 * `Config` decorator and metadata.
 */
export interface Config {
  /**
   * Order of loading
   */
  order: number;
}

const configDecorator = (defaultOrder: number): ConfigDecorator =>
  makeDecorator(
    METADATA_KEY.config,
    (order = defaultOrder) => ({ order }),
    (cls: Type<any>, annotationInstance: Config) => {
      injectable()(cls);
      Register({
        type: TYPE.Config,
        options: { order: annotationInstance.order },
      })(cls);
    },
    true,
    ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR,
  );

export const CoreConfig: ConfigDecorator = configDecorator(ORDER_CONFIG.Core);

export const PluginConfig: ConfigDecorator = configDecorator(
  ORDER_CONFIG.Plugin,
);

export const Config: ConfigDecorator = configDecorator(ORDER_CONFIG.Config);
