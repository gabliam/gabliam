import { TYPE } from '../constants';
// import { fluentProvider } from '../container';
import { registry } from '../registry';
import { interfaces, injectable } from 'inversify';
import { container } from '../container';

export function Service(name?: string) {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = name ? name : target;
        // fluentProvider(id)
        //     .inSingletonScope()
        //     .done()(target);
        container.bind<any>(id).to(target).inSingletonScope();
        injectable()(target);
        registry.add(TYPE.Service, id);
    };
}