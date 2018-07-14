import { METADATA_KEY } from '../constants';

/**
 * Set method that be called before the class was destroyed
 *
 * sample:
 * @Service()
 * class RedisService {
 *  redis: ioredis;
 *
 *  init() {
 *    this.redis = new Redis();
 *  }
 *
 *  @preDestroy()
 *  destroy() {
 *    this.redis.close();
 *  }
 * }
 */
export function preDestroy(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    let metadataList: Array<string | symbol> = [];
    if (!Reflect.hasMetadata(METADATA_KEY.preDestroy, target.constructor)) {
      Reflect.defineMetadata(
        METADATA_KEY.preDestroy,
        metadataList,
        target.constructor
      );
    } else {
      metadataList = Reflect.getMetadata(
        METADATA_KEY.preDestroy,
        target.constructor
      );
    }
    metadataList.push(propertyKey);
  };
}
