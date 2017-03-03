import { interfaces as coreInterfaces, inversifyInterfaces, Scan, Registry } from '@gabliam/core';
import { TYPE, LIST_DOCUMENT} from './constants';
import * as interfaces from './interfaces';
import * as express from 'express';
import * as d from 'debug';
const debug = d('Gabliam:Plugin:mongoose');



export * from './decorators';
export { interfaces };

@Scan(__dirname)
export default class RestPlugin implements coreInterfaces.GabliamPlugin {

    bind(app: express.Application, container: inversifyInterfaces.Container, registry: Registry) {
        let documents = registry.get(TYPE.Document)
            .map(({ id, target }) => {
                return target;
            });
        debug('list documents', documents);
        container.bind<any>(LIST_DOCUMENT).toConstantValue(documents);
    }

    build(app: express.Application, container: inversifyInterfaces.Container, registry: Registry) {
        
    }
}