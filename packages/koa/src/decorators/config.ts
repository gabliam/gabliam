import { ERRORS_MSGS } from '../constants';
import { METADATA_KEY, createConfigDecorator } from '@gabliam/rest-decorators';

/**
 * KoaConfig decorator
 *
 * Add config for Koa
 * The method take on parameter an Koa Application
 *
 * ## Simple Example
 * @Config(200)
 * export class ServerConfig {
 *  @KoaConfig()
 *  addKoaConfig(app: koa) {
 *    app.use(
 *      bodyParser.urlencoded({
 *        extended: true
 *      })
 *    );
 *    app.use(bodyParser.json());
 *    app.use(helmet());
 *  }
 * }
 * @param {number=1} order order of Koa config
 */
export function KoaConfig(order: number = 1) {
  return createConfigDecorator(
    METADATA_KEY.MiddlewareConfig,
    order,
    ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
  );
}
