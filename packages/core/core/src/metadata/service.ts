import { injectable, interfaces } from 'inversify';
import { TYPE, METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';
import { Register } from './register';

/**
 * Type of the `Service` decorator / constructor function.
 */
export interface ServiceDecorator {
  /**
   * Decorator that marks a class as an Gabliam Service and provides configuration
   * metadata that determines how the config should be processed,
   * instantiated.
   *
   * @usageNotes
   *
   * ```typescript
   * @Service()
   * class GretterService {
   *    constructor(private gretter: Gretter) {
   *       gretter.greet();
   *    }
   * }
   *
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
  (name?: string): any;

  /**
   * see the `@Service` decorator.
   */
  new (name?: string): any;
}

/**
 * `Service` decorator and metadata.
 */
export interface Service {
  /**
   * Name of Service
   */
  name?: string;
}

export const Service: ServiceDecorator = makeDecorator(
  METADATA_KEY.service,
  (name?: string): Service => ({ name }),
  (cls, annotationInstance: Service) => {
    const id: interfaces.ServiceIdentifier<any> = annotationInstance.name
      ? annotationInstance.name
      : cls;
    injectable()(cls);
    Register({ type: TYPE.Service, id })(cls);
  }
);
