import { TYPE } from '../constants';
import { interfaces, injectable } from 'inversify';
import { register } from './register';

/**
 * Service decorator
 *
 * Add a service
 * @param  {string} name? name of the service
 */
export function Service(name?: string) {
  return function (target: any) {
    const id: interfaces.ServiceIdentifier<any> = name ? name : target;
    injectable()(target);
    register(TYPE.Service, { id, target })(target);
  };
}
