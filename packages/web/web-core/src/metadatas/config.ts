import { makePropDecorator } from '@gabliam/core';
import { ERRORS_MSGS, METADATA_KEY } from '../constants';

/**
 * Type of the `WebConfig` decorator / constructor function.
 */
export interface WebConfigDecorator {
  /**
   * Decorator that marks a class field as an WebConfig property
   * and supplies configuration metadata.
   *
   * A webconfig must be in config class
   *
   * The method take on parameter an Application and container
   *
   * @usageNotes
   *
   * You can supply an optional order for prioritize the configuration.
   * By default, order is 1
   *
   * The following example configure helmet. `@gabliam/express` is installed
   *
   * ```typescript
   * @Config(200)
   * export class ServerConfig {
   *  @WebConfig()
   *  addExpressConfig(app: express.Application, container: container) {
   *    app.use(helmet());
   *  }
   * }
   * ```
   *
   *  The following example configure helmet. `@gabliam/koa` is installed
   *
   * ```typescript
   * @Config(200)
   * export class ServerConfig {
   *  @WebConfig()
   *  addExpressConfig(app: koa.Application, container: container) {
   *    app.use(helmet());
   *  }
   * }
   * ```
   */
  (order?: number): MethodDecorator;

  /**
   * see the `@WebConfig` decorator.
   */
  new (order?: number): any;
}

/**
 * `WebConfig` decorator and metadata.
 */
export interface WebConfig {
  /**
   * Order of config
   */
  order: number;
}

export const WebConfig: WebConfigDecorator = makePropDecorator(
  METADATA_KEY.webConfig,
  (order: number = 1): WebConfig => ({ order }),
  undefined,
  true,
  ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
);

/**
 * Type of the `WebConfigAfterControllers` decorator / constructor function.
 */
export interface WebConfigAfterControllersDecorator {
  /**
   * Decorator that marks a class field as an WebConfigAfterControllers property
   * and supplies configuration metadata.
   *
   * A WebConfigAfterControllers must be in config class
   *
   * The method take on parameter an Application and container
   *
   * @usageNotes
   *
   * You can supply an optional order for prioritize the configuration.
   * By default, order is 1
   *
   * The following example configure celebrate errors. `@gabliam/express` is installed
   *
   * ```typescript
   * @Config()
   * export class ServerConfig {
   *  @WebConfigAfterControllers()
   *  addErrorConfig(app: express.Application) {
   *    // user errors celebrate
   *    app.use(Celebrate.errors());
   *  }
   * }
   * ```
   */
  (order?: number): MethodDecorator;

  /**
   * see the `@WebConfigAfterControllers` decorator.
   */
  new (order?: number): any;
}

/**
 * `WebConfigAfterControllers` decorator and metadata.
 */
export interface WebConfigAfterControllers {
  /**
   * Order of config
   */
  order: number;
}

export const WebConfigAfterControllers: WebConfigAfterControllersDecorator = makePropDecorator(
  METADATA_KEY.webConfigAfterControllers,
  (order: number = 1): WebConfigAfterControllers => ({ order }),
  undefined,
  true,
  ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
);
