import { interfaces as coreInterfaces, inversifyInterfaces, Scan, Registry } from '@gabliam/core';
import { TYPE, LIST_DOCUMENT } from './constants';
import * as interfaces from './interfaces';
import * as d from 'debug';
const debug = d('Gabliam:Plugin:mongoose');
import { MongooseConnection } from './mongoose-connection';



export * from './decorators';
export { interfaces };
export * from './mongoose-connection';
export * from './repository';

@Scan(__dirname)
export default class MongoosePlugin implements coreInterfaces.GabliamPlugin {

  bind(container: inversifyInterfaces.Container, registry: Registry) {
    const documents = registry.get(TYPE.Document)
      .map(({ id, target }) => {
        return target;
      });
    debug('list documents', documents);
    container.bind<any>(LIST_DOCUMENT).toConstantValue(documents);
  }

  async destroy(container: inversifyInterfaces.Container, registry: Registry) {
    const connection = container.get<MongooseConnection>(MongooseConnection);
    if (connection) {
      await connection.conn.close();
    }
  }
}
