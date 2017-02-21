import { TYPE } from '../constants';
// import { fluentProvider } from '../container';
import { registry } from '../registry';
import { interfaces, injectable } from 'inversify';
import { ORDER_CONFIG } from '../constants';

import { container,  } from '../container';

export function Config(order = ORDER_CONFIG.Config) {
    return configDecorator(order);
}

export function CoreConfig(order = ORDER_CONFIG.Core) {
    return configDecorator(order);
}

export function PluginConfig(order = ORDER_CONFIG.Plugin) {
    return configDecorator(order);
}

function configDecorator(order: number) {
    return function (target: any) {
        let id: interfaces.ServiceIdentifier<any> = target;
        // fluentProvider(id)
        //     .inSingletonScope()
        //     .done()(target);
        container.bind<any>(id).to(target).inSingletonScope();
        injectable()(target);
        registry.add(TYPE.Config, { id, order });
    };
}

