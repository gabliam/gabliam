import { METADATA_KEY } from '../constants';

export function Scan(path: string) {
    return function (target: any) {
        let paths = [];
        if (!Reflect.hasOwnMetadata(METADATA_KEY.scan, target)) {
            Reflect.defineMetadata(METADATA_KEY.scan, paths, target);
        } else {
            paths = Reflect.getOwnMetadata(METADATA_KEY.scan, target);
        }
        paths.push(path);
    };
}
