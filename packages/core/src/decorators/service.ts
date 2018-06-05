import { injectable, interfaces } from 'inversify';
import { METADATA_KEY, TYPE } from '../constants';
import { register } from './register';

/**
 * Service decorator
 *
 * Add a service
 * @param  {string} name? name of the service
 */
export function Service(name?: string) {
  return function(target: any) {
    Reflect.defineMetadata(METADATA_KEY.service, true, target);
    const id: interfaces.ServiceIdentifier<any> = name ? name : target;
    injectable()(target);
    register(TYPE.Service, { id, target })(target);
  };
}
