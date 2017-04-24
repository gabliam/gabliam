import { Bean } from '@gabliam/core';
import { addMiddlewareMetadata } from '../metadata';


/**
 * MiddlewareInject decorator
 *
 * Injection fs Middleware that are created with @Middleware
 * Middleware can be inject at the top of controller (The middleware is valid for all method) or on method
 *
 *## Simple Example
 *
 * @param  {string} name name of Middleware to inject
 * @param  {any[]} ...values values for configuration of Middleware
 */
export function MiddlewareInject(name: string, ...values: any[]) {
    return function (target: any, key?: string) {
        let realTarget = target;
        // if key != undefined then it's a property decorator
        if (key !== undefined) {
            realTarget = target.constructor;
        }
        addMiddlewareMetadata([{name, values}], realTarget, key);
    };
};

/**
 * Middleware Decorator
 *
 * Middleware must return MiddlewareConfigurator
 * @see MiddlewareConfigurator
 *
 * Create new Middleware
 *
 * ## Simple Example
 * @Config()
 * Class SampleConfig {
 *      @Middleware('log')
 *      createLogMiddleware() {
 *          return () => (req: Request, res: express.Response, next: express.NextFunction) => {
 *              console.log(req);
 *              next();
 *          };
 *      }
 * }
 *
 * @RestController()
 * class Sample {
 *  @MiddlewareInject('log')
 *  @Get('/hello')
 *  hello() {
 *  return 'hello world';
 *  }
 * }
 *
 * @param  {string} name name of Middleware
 */
export function Middleware(name: string) {
    return Bean(`${name}Middleware`);
};
