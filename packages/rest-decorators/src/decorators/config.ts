import { ConfigMetadata } from '../interfaces';

export function createConfigDecorator(
  type: string,
  order: number,
  errorMsg: string
) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const id = target.constructor.name;
    const metadata: ConfigMetadata = { id, key, order };
    let metadataList: ConfigMetadata[] = [];

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
