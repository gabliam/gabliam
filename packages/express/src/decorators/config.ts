import { METADATA_KEY } from '../constants';
import { ExpressConfigMetadata } from '../interfaces';

export function ExpressConfig() {
  return ExpressConfigDecorator(METADATA_KEY.MiddlewareConfig);
};

export function ExpressErrorConfig() {
  return ExpressConfigDecorator(METADATA_KEY.MiddlewareErrorConfig);
};

function ExpressConfigDecorator(type: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const id = target.constructor.name;
    const metadata: ExpressConfigMetadata = { id, key };
    let metadataList: ExpressConfigMetadata[] = [];

    if (!Reflect.hasOwnMetadata(type, target.constructor)) {
      Reflect.defineMetadata(type, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(type, target.constructor);
    }

    metadataList.push(metadata);
  };
};
