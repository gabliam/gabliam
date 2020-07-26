import {
  Scan,
  Registry,
  Plugin,
  GabliamPlugin,
  Container,
} from '@gabliam/core';
import { TYPE, LIST_DOCUMENT } from './constants';
import d from 'debug';
const debug = d('Gabliam:Plugin:mongoose');
import { MongooseConnectionManager } from './connection-manager';

@Plugin()
@Scan()
export class MongoosePlugin implements GabliamPlugin {
  bind(container: Container, registry: Registry) {
    const documents = registry.get(TYPE.Document).map(({ id, target }) => {
      return target;
    });
    debug('list documents', documents);
    container.bind<any>(LIST_DOCUMENT).toConstantValue(documents);
  }

  async destroy(container: Container, registry: Registry) {
    const connectionManager = container.get(MongooseConnectionManager);
    await connectionManager.close();
  }
}
