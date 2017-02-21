import { interfaces } from 'inversify';
import { BeanMetadata } from '../interfaces';
import { METADATA_KEY } from '../constants';


export function Bean(id: interfaces.ServiceIdentifier<any>) {
    return function(target, key: string, descriptor: PropertyDescriptor) {

        let metadata: BeanMetadata = { id, target, key };
        let metadataList: BeanMetadata[] = [];

        if (!Reflect.hasOwnMetadata(METADATA_KEY.bean, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.bean, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.bean, target.constructor);
        }

        metadataList.push(metadata);
    }
}