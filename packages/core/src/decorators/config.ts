import { TYPE } from '../constants';
import { register } from './register';
import { interfaces, injectable } from 'inversify';
import { ORDER_CONFIG } from '../constants';

/**
 * Config decorator
 *
 * Define a config class.
 * This class is loaded by the framework and all beans are injected in the container
 *
 * ## Simple Example
 * Here is an example of a class that define a bean
 *
 * ```
 *  class Gretter {
 *      constructor(private name:string){};
 *      greet() {
 *          return `Hello ${this.name} !`;
 *      }
 *  }
 *
 * @Config
 * class SampleConfig {
 *      @Bean(Gretter)
 *      createGretter() {
 *          return new Gretter('David');
 *      }
 * }
 * ```
 *
 * @param  {number=ORDER_CONFIG.Config} order order of loading
 */
export function Config(order: number = ORDER_CONFIG.Config) {
    return configDecorator(order);
}

/**
 * CoreConfig decorator
 *
 * Define a core config class.
 * This class is loaded by the framework and all beans are injected in the container
 *
 * ## Simple Example
 * Here is an example of a class that define a bean
 *
 * ```
 *  class Gretter {
 *      constructor(private name:string){};
 *      greet() {
 *          return `Hello ${this.name} !`;
 *      }
 *  }
 *
 * @CoreConfig
 * class SampleConfig {
 *      @Bean(Gretter)
 *      createGretter() {
 *          return new Gretter('David');
 *      }
 * }
 * ```
 *
 * @param  {number=ORDER_CONFIG.Core} order order of loading
 */
export function CoreConfig(order = ORDER_CONFIG.Core) {
    return configDecorator(order);
}

/**
 * PluginConfig decorator
 *
 * Define a plugin config class.
 * This class is loaded by the framework and all beans are injected in the container
 *
 * ## Simple Example
 * Here is an example of a class that define a bean
 *
 * ```
 *  class Gretter {
 *      constructor(private name:string){};
 *      greet() {
 *          return `Hello ${this.name} !`;
 *      }
 *  }
 *
 * @CoreConfig
 * class SampleConfig {
 *      @Bean(Gretter)
 *      createGretter() {
 *          return new Gretter('David');
 *      }
 * }
 * ```
 *
 * @param  {number=ORDER_CONFIG.Core} order order of loading
 */
export function PluginConfig(order = ORDER_CONFIG.Plugin) {
    return configDecorator(order);
}

function configDecorator(order: number) {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = target;
        injectable()(target);
        register(TYPE.Config, { id, order, target })(target);
    };
}

