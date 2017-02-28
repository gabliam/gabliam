import { METADATA_KEY } from '../constants';
import { ValueMetadata } from '../interfaces';


export function Value(path: string) {
    return function(target: any, key: string) {
        valueProperty(path, target, key);
    };
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
