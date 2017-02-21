import { TYPE } from '../constants';
import { registry } from '../registry';
import { interfaces, injectable } from 'inversify';

export function Service(name?: string) {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = name ? name : target;
        injectable()(target);
        registry.add(TYPE.Service, { id, target });
    };
}