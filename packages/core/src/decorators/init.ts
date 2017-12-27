import { METADATA_KEY } from '../constants';

/**
 * Init decorator
 *
 * Add init method in config class
 *
 * This method is called after the creation of all beans of the config class
 */
export function Init() {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const metadata = key;
    let metadataList: string[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.init, target.constructor)) {
      Reflect.defineMetadata(
        METADATA_KEY.init,
        metadataList,
        target.constructor
      );
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.init, target.constructor);
    }

    metadataList.push(metadata);
  };
}

/**
 * BeforeCreate decorator
 *
 * Add init method in config class
 *
 * This method is called before the creation of all beans of the config class
 */
export function BeforeCreate() {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const metadata = key;
    let metadataList: string[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.beforeCreate, target.constructor)) {
      Reflect.defineMetadata(
        METADATA_KEY.beforeCreate,
        metadataList,
        target.constructor
      );
    } else {
      metadataList = Reflect.getMetadata(
        METADATA_KEY.beforeCreate,
        target.constructor
      );
    }

    metadataList.push(metadata);
  };
}
