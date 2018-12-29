import { METADATA_KEY } from '../constants';
import { makePropDecorator } from '../decorator';

/**
 * Type of the `Init` decorator / constructor function.
 */
export interface InitDecorator {
  /**
   * Decorator that marks a class field as an init property and supplies configuration metadata.
   * Declare a init property, wich Gabliam automatically call after the creation of
   * all beans of the config class
   *
   * @usageNotes
   *
   * Here is an example of a class that define a init
   *
   * ```typescript
   *
   * @Config()
   * class SampleConfig {
   *   db: Connection;
   *
   *   @Init()
   *   async init() {
   *     await this.db.start();
   *   }
   *
   *   @Bean()
   *   createGretter() {
   *     this.db = new Connection();
   *     return this.db;
   *   }
   * }
   * ```
   */
  (): MethodDecorator;
  /**
   * see the `@Init` decorator.
   */
  new (): any;
}

export const Init: InitDecorator = makePropDecorator(METADATA_KEY.init);

/**
 * Type of the `BeforeCreate` decorator / constructor function.
 */
export interface BeforeCreateDecorator {
  /**
   * Decorator that marks a class field as a BeforeCreate property and supplies configuration metadata.
   * Declare a BeforeCreate property, wich Gabliam automatically call before the creation of
   * all beans of the config class
   */
  (): any;
  /**
   * see the `@BeforeCreate` decorator.
   */
  new (): any;
}

export const BeforeCreate: BeforeCreateDecorator = makePropDecorator(
  METADATA_KEY.beforeCreate
);
