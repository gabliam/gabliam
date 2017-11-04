import { ControllerMetadata, MiddlewareMetadata } from '../interfaces';
import { METADATA_KEY, TYPE, ERRORS_MSGS } from '../constants';
import { inversifyInterfaces, injectable, register } from '@gabliam/core';
import { addMiddlewareMetadata } from '../metadata';

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

  /**
   * List of middlewares
   */
  middlewares?: MiddlewareMetadata[];
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
    throw new Error(ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR);
  }

  let path: string;
  let id: inversifyInterfaces.ServiceIdentifier<any> = target;
  let middlewares: MiddlewareMetadata[] = [];
  if (typeof options === 'string') {
    path = options;
  } else {
    path = options.path;
    middlewares = options.middlewares || [];
    if (options.name) {
      id = options.name;
    }
  }

  addMiddlewareMetadata(middlewares, target);

  const metadata: ControllerMetadata = { path, json };
  Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  injectable()(target);
  register(TYPE.Controller, { id, target })(target);
}
