import { interfaces } from 'inversify';
import { ConfigMethodMetadata } from '../interfaces';
import { METADATA_KEY } from '../constants';


export function Bean(id: interfaces.ServiceIdentifier<any>) {
    return function(target, key: string, descriptor: PropertyDescriptor) {

        let metadata: ConfigMethodMetadata = { id, target, key };
        let metadataList: ConfigMethodMetadata[] = [];

        if (!Reflect.hasOwnMetadata(METADATA_KEY.Bean, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.Bean, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.Bean, target.constructor);
        }

        metadataList.push(metadata);
    }
}