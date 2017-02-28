import { TYPE } from '../constants';
// import { registry } from '../registry';
import { interfaces, injectable } from 'inversify';
import { register } from './register';

export function Service(name?: string) {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = name ? name : target;
        injectable()(target);
        register(TYPE.Service, { id, target })(target);
        // registry.add(TYPE.Service, { id, target });
    };
}
