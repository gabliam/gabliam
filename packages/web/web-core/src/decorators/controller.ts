import { injectable, inversifyInterfaces, Register } from '@gabliam/core';
import { ERRORS_MSGS, METADATA_KEY, TYPE } from '../constants';

/**
 * Controller metadata
 */
export interface ControllerMetadata {
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

/**
 * Controller decorator
 *
 * Define a controller class
 * if a method return a result, pass to res.send
 *
 * ## Simple example
 * @Controller('/')
 * class SampleController {
 *    @get('/')
 *    hello() {
 *      return 'Hello';
 *    }
 * }
 *
 * @param {ControllerOptions | string} options if options is a string, it's define the path
 */
export function Controller(options: ControllerOptions | string) {
  return function(target: any) {
    decorateController(options, target, false);
  };
}

/**
 * Rest controller
 *
 * Define a rest controller
 *
 * if a method return a result, pass to res.json
 *
 * ## Simple example
 * @Controller('/')
 * class SampleController {
 *    @get('/')
 *    hello() {
 *      return { hi: 'Hello' };
 *    }
 * }
 * @param options
 */
export function RestController(options: ControllerOptions | string) {
  return function(target: any) {
    decorateController(options, target, true);
  };
}

function decorateController(
  options: ControllerOptions | string,
  target: any,
  json: boolean
) {
  if (Reflect.hasOwnMetadata(METADATA_KEY.controller, target) === true) {
    throw new Error(ERRORS_MSGS.DUPLICATED_CONTROLLER_DECORATOR);
  }

  let path: string;
  let id: inversifyInterfaces.ServiceIdentifier<any> = target;
  if (typeof options === 'string') {
    path = options;
  } else {
    path = options.path;
    if (options.name) {
      id = options.name;
    }
  }

  const metadata: ControllerMetadata = { path, json };
  Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  injectable()(target);
  Register({ type: TYPE.Controller, id })(target);
}
