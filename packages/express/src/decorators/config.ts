import { METADATA_KEY, ERRORS_MSGS } from '../constants';
import { ExpressConfigMetadata } from '../interfaces';

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
  return ExpressConfigDecorator(METADATA_KEY.MiddlewareConfig, order);
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
  return ExpressConfigDecorator(METADATA_KEY.MiddlewareErrorConfig, order);
}

function ExpressConfigDecorator(type: string, order: number) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const id = target.constructor.name;
    const metadata: ExpressConfigMetadata = { id, key, order };
    let metadataList: ExpressConfigMetadata[] = [];

    if (!Reflect.hasOwnMetadata(type, target.constructor)) {
      Reflect.defineMetadata(type, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(type, target.constructor);
    }

    const find = metadataList.find(m => m.key === key && m.id === id);

    if (find) {
      throw new Error(ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR);
    }

    metadataList.push(metadata);
  };
}
