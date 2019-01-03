import {
  injectable,
  inversifyInterfaces,
  Register,
  makeDecorator,
} from '@gabliam/core';
import { ERRORS_MSGS, METADATA_KEY, TYPE } from '../constants';

/**
 * Controller options
 */
export interface ControllerOptions {
  /**
   * Name of controller
   */
  name?: string;

  /**
   * Path of controller
   */
  path: string;
}

export interface ControllerMetadata {
  /**
   * Name of Controller
   */
  name?: string;

  /**
   * path for the controller
   * this path is concatenated with path of each method
   */
  path: string;

  /**
   * If a method return a value :
   *  - if true : res.json
   *  - if false: res.send
   */
  json: boolean;
}

/**
 * Type of the `Controller` decorator / constructor function.
 */
export interface ControllerDecorator {
  /**
   * Decorator that marks a class as an Gabliam Controller and provides configuration
   * metadata that determines how the config should be processed,
   * instantiated.
   *
   * @usageNotes
   *
   * A string must be passed to set the base path of the controller.
   *
   * A controller can return a gabliamValue (@see promise-utils gabliamValue).
   * A controller can return a ResponseEntity
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @get('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (options: ControllerOptions | string): ClassDecorator;

  /**
   * see the `@Controller` decorator.
   */
  new (options: ControllerOptions | string): any;
}

/**
 * `Controller` decorator and metadata.
 */
export interface Controller extends ControllerMetadata {
  json: false;
}

export const Controller: ControllerDecorator = makeDecorator(
  METADATA_KEY.controller,
  (options: ControllerOptions | string): Controller => {
    let path: string;
    let name: string | undefined;
    if (typeof options === 'string') {
      path = options;
    } else {
      path = options.path;
      if (options.name) {
        name = options.name;
      }
    }

    return { path, name, json: false };
  },
  (cls, annotationInstance: Controller) => {
    let id: inversifyInterfaces.ServiceIdentifier<any> = cls;
    if (annotationInstance.name) {
      id = annotationInstance.name;
    }
    injectable()(cls);
    Register({ type: TYPE.Controller, id })(cls);
  },
  true,
  ERRORS_MSGS.DUPLICATED_CONTROLLER_DECORATOR
);
/**
 * Type of the `RestController` decorator / constructor function.
 */
export interface RestControllerDecorator {
  /**
   * Decorator that marks a class as an Gabliam RestController and provides configuration
   * metadata that determines how the config should be processed,
   * instantiated.
   *
   * @usageNotes
   *
   * A string must be passed to set the base path of the RestController.
   *
   * A RestController can return a gabliamValue (@see promise-utils gabliamValue).
   * A RestController can return a ResponseEntity
   *
   * ```typescript
   * @RestController('/')
   * class SampleRestController {
   *    @get('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (options: ControllerOptions | string): ClassDecorator;

  /**
   * see the `@RestController` decorator.
   */
  new (options: ControllerOptions | string): any;
}

/**
 * `RestController` decorator and metadata.
 */
export interface RestController extends ControllerMetadata {
  /**
   * If a method return a value :
   *  - if true : res.json
   *  - if false: res.send
   */
  json: true;
}

export const RestController: RestControllerDecorator = makeDecorator(
  METADATA_KEY.controller,
  (options: ControllerOptions | string): RestController => {
    let path: string;
    let name: string | undefined;
    if (typeof options === 'string') {
      path = options;
    } else {
      path = options.path;
      if (options.name) {
        name = options.name;
      }
    }

    return { path, name, json: true };
  },
  (cls, annotationInstance: RestController) => {
    let id: inversifyInterfaces.ServiceIdentifier<any> = cls;
    if (annotationInstance.name) {
      id = annotationInstance.name;
    }
    injectable()(cls);
    Register({ type: TYPE.Controller, id })(cls);
  },
  true,
  ERRORS_MSGS.DUPLICATED_CONTROLLER_DECORATOR
);
