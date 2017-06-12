import { TYPE, METADATA_KEY, ERRORS_MSGS } from '../constants';
import { interfaces, injectable } from 'inversify';
import { register } from './register';

/**
 * Service decorator
 *
 * Add a service
 * @param  {string} name? name of the service
 */
export function Service(name?: string) {
  return function(target: any) {
    if (Reflect.hasOwnMetadata(METADATA_KEY.service, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_SERVICE_DECORATOR);
    }
    Reflect.defineMetadata(METADATA_KEY.service, true, target);
    const id: interfaces.ServiceIdentifier<any> = name ? name : target;
    injectable()(target);
    register(TYPE.Service, { id, target })(target);
  };
}
