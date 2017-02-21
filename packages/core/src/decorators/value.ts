import { container } from '../container';
import { APP_CONFIG, METADATA_KEY } from '../constants';
import { ValueMetadata } from '../interfaces';
import * as _ from 'lodash';


export function Value(path: string) {
    return function(target: any, key: string, descriptor?: PropertyDescriptor) {
        if (descriptor === undefined) {
            valueProperty(path, target, key)
        } else {
            valueGetterSetter(path, target, key, descriptor);
        }
    }
}

function valueProperty(path: string, target: any, key: string) {
    let metadata: ValueMetadata = { path, target, key };
    let metadataList: ValueMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.value, target.constructor)) {
        Reflect.defineMetadata(METADATA_KEY.value, metadataList, target.constructor);
    } else {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.value, target.constructor);
    }

    metadataList.push(metadata);
}


function valueGetterSetter(path: string, target: any, key: string, descriptor: PropertyDescriptor) {
    let oldGet = descriptor.get;
    descriptor.get = () => {
        let config = container.get(APP_CONFIG);
        return _.get(config, path, oldGet());
    }
}
