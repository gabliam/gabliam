import { METADATA_KEY } from '../constants';

/**
 * Register decorator
 *
 * All values are used on building phase
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
