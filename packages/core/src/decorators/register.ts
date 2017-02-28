import { METADATA_KEY } from '../constants';

export function register(type, value) {
    return function (target) {
        if (!Reflect.hasOwnMetadata(METADATA_KEY.register, target)) {
            Reflect.defineMetadata(METADATA_KEY.register, { type, value }, target);
        }
        return target;
    };
}
