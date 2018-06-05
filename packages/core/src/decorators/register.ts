import { METADATA_KEY } from '../constants';
import { ValueRegistry } from '../interfaces';

/**
 * Register decorator
 *
 * All values are used on building phase
 *
 * @param  {string} type type in registry
 * @param  {any} value
 */
export function register(type: string, value: ValueRegistry) {
  return function(target: any) {
    Reflect.defineMetadata(METADATA_KEY.register, { type, value }, target);
    return target;
  };
}
