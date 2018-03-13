import { ERRORS_MSGS } from '../constants';
import { METADATA_KEY, createConfigDecorator } from '@gabliam/rest-decorators';

/**
 * ExpressConfig decorator
 *
 * Add config for express
 * The method take on parameter an express Application
 *
 * ## Simple Example
 * @Config(200)
 * export class ServerConfig {
 *  @ExpressConfig()
 *  addExpressConfig(app: express.Application) {
 *    app.use(
 *      bodyParser.urlencoded({
 *        extended: true
 *      })
 *    );
 *    app.use(bodyParser.json());
 *    app.use(helmet());
 *  }
 * }
 * @param {number=1} order order of express config
 */
export function ExpressConfig(order: number = 1) {
  return createConfigDecorator(
    METADATA_KEY.MiddlewareConfig,
    order,
    ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
  );
}

/**
 * ExpressErrorConfig decorator
 *
 * Add error config for express
 * The method take on parameter an express Application
 *
 * ## Simple Example
 * @Config()
 * export class ServerConfig {
 *  @ExpressErrorConfig()
 *  addErrorConfig(app: express.Application) {
 *    // user errors celebrate
 *    app.use(Celebrate.errors());
 *  }
 * }
 * @param {number=1} order order of express config
 */
export function ExpressErrorConfig(order: number = 1) {
  return createConfigDecorator(
    METADATA_KEY.MiddlewareErrorConfig,
    order,
    ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
  );
}
