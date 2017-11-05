import { METADATA_KEY, ERRORS_MSGS } from '../constants';
import { KoaConfigMetadata } from '../interfaces';

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
  return KoaConfigDecorator(METADATA_KEY.MiddlewareConfig, order);
}

function KoaConfigDecorator(type: string, order: number) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const id = target.constructor.name;
    const metadata: KoaConfigMetadata = { id, key, order };
    let metadataList: KoaConfigMetadata[] = [];

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
