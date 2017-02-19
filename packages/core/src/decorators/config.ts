import { TYPE } from '../constants';
import { fluentProvider } from '../container';
import { registry } from '../registry';
import { interfaces } from 'inversify';

export function Config() {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = target;
        fluentProvider(id)
            .inSingletonScope()
            .done()(target);
        registry.add(TYPE.Config, id);
    };
}