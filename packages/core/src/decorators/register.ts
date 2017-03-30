import { METADATA_KEY } from '../constants';

/**
 * Register decorator
 * 
 * 
 * @param  {string} type type in registry
 * @param  {any} value
 */
export function register(type: string, value: any) {
    return function (target) {
        if (!Reflect.hasOwnMetadata(METADATA_KEY.register, target)) {
            Reflect.defineMetadata(METADATA_KEY.register, { type, value }, target);
        }
        return target;
    };
}
