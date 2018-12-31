import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';
import { makePropDecorator } from '../decorator';

/**
 * Type of the `Bean` decorator / constructor function.
 */
export interface BeanDecorator {
  /**
   * Decorator that marks a class field as an bean property and supplies configuration metadata.
   * Declare a bean property, wich Gabliam automatically create
   * during config phase
   *
   * @usageNotes
   *
   * Here is an example of a class that define a bean
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
   *
   * @Service()
   * class SampleService {
   *  constructor(gretter: Gretter) {
   *      console.log(gretter.greet()); // display Hello David !
   *  }
   * }
   * ```
   */
  (id: interfaces.ServiceIdentifier<any>): MethodDecorator;

  /**
   * see the `@Bean` decorator.
   */
  new (id: interfaces.ServiceIdentifier<any>): any;
}

/**
 * Type of metadata for an `Bean` property.
 */
export interface Bean {
  /**
   * Id of bean
   */
  id: interfaces.ServiceIdentifier<any>;
}

export const Bean: BeanDecorator = makePropDecorator(
  METADATA_KEY.bean,
  (id: interfaces.ServiceIdentifier<any>) => ({ id })
);

/**
 * Type of the `OnMissingBean` decorator / constructor function.
 */
export interface OnMissingBeanDecorator {
  /**
   * Decorator that marks a class field as an OnMissingBean property and supplies configuration metadata.
   * Declare a bean property, wich Gabliam automatically create
   * during config phase when the bean is missing
   *
   * @usageNotes
   *
   * Here is an example of a class that define a bean
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
   *      @OnMissingBean('Gretter')
   *      @Bean('Gretter')
   *      createGretter() {
   *          return new Gretter('David');
   *      }
   * }
   *
   * @Service()
   * class SampleService {
   *  constructor(@Inject('Gretter') gretter: Gretter) {
   *      console.log(gretter.greet()); // display Hello David !
   *  }
   * }
   * ```
   */
  (id: interfaces.ServiceIdentifier<any>): MethodDecorator;

  /**
   * see the `@OnMissingBean` decorator.
   */
  new (id: interfaces.ServiceIdentifier<any>): any;
}

/**
 * Type of metadata for an `OnMissingBean` property.
 */
export interface OnMissingBean {
  /**
   * id of missing bean
   */
  id: interfaces.ServiceIdentifier<any>;
}

export const OnMissingBean: OnMissingBeanDecorator = makePropDecorator(
  METADATA_KEY.onMissingBean,
  (id: interfaces.ServiceIdentifier<any>) => ({ id })
);
