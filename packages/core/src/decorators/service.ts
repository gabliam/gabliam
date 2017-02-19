import { TYPE } from '../constants';
import { fluentProvider } from '../container';
import { registry } from '../registry';
import {interfaces} from 'inversify';


export function Service(name?: string) {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = name ? name : target;
        fluentProvider(id)
            .inSingletonScope()
            .done()(target);
        registry.add(TYPE.Service, id);
    };
}