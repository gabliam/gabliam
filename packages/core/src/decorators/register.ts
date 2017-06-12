import { METADATA_KEY, ERRORS_MSGS } from '../constants';

/**
 * Register decorator
 *
 * All values are used on building phase
 *
 * @param  {string} type type in registry
 * @param  {any} value
 */
export function register(type: string, value: any) {
  return function(target: any) {
    if (Reflect.hasOwnMetadata(METADATA_KEY.register, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_REGISTER_DECORATOR);
    }
    Reflect.defineMetadata(METADATA_KEY.register, { type, value }, target);
    return target;
  };
}
