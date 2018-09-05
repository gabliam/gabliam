import { ERRORS_MSGS, METADATA_KEY } from '../constants';
import { inversifyInterfaces } from '@gabliam/core';

/**
 * Web Config Metadata
 */
export interface WebConfigMetadata {
  /**
   * id of class config
   */
  id: inversifyInterfaces.ServiceIdentifier<any>;

  /**
   * key of the method that has an web config
   */
  key: string;

  /**
   * order of execute of the config
   */
  order: number;
}

/**
 * WebConfig decorator
 *
 * Add config
 * The method take on parameter an Application and container
 *
 * ## Simple Example with express
 * @Config(200)
 * export class ServerConfig {
 *  @WebConfig()
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
export function WebConfig(order: number = 1) {
  return createWebConfigDecorator(
    METADATA_KEY.webConfig,
    order,
    ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
  );
}

/**
 * WebConfigAfterControllers decorator
 *
 * Add config after controllers
 * The method take on parameter an application and container
 *
 * ## Simple Example (with express)
 * @Config()
 * export class ServerConfig {
 *  @WebConfigAfterControllers()
 *  addErrorConfig(app: express.Application) {
 *    // user errors celebrate
 *    app.use(Celebrate.errors());
 *  }
 * }
 * @param {number=1} order order of express config
 */
export function WebConfigAfterControllers(order: number = 1) {
  return createWebConfigDecorator(
    METADATA_KEY.webConfigAfterControllers,
    order,
    ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR
  );
}

/**
 * @alias WebConfigAfterControllers
 */
export const WebConfigAfterCtl = WebConfigAfterControllers;

function createWebConfigDecorator(
  type: string,
  order: number,
  errorMsg: string
) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const id = target.constructor.name;
    const metadata: WebConfigMetadata = { id, key, order };
    let metadataList: WebConfigMetadata[] = [];

    if (!Reflect.hasOwnMetadata(type, target.constructor)) {
      Reflect.defineMetadata(type, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(type, target.constructor);
    }

    const find = metadataList.find(m => m.key === key && m.id === id);

    if (find) {
      throw new Error(errorMsg);
    }

    metadataList.push(metadata);
  };
}
