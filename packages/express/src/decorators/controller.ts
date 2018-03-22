import {
  createControllerDecorator,
  createRestControllerDecorator,
  ControllerDecorator
} from '@gabliam/web-core';
import { express } from '../express';

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
export const Controller: ControllerDecorator<
  express.RequestHandler
> = createControllerDecorator;

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
export const RestController: ControllerDecorator<
  express.RequestHandler
> = createRestControllerDecorator;
