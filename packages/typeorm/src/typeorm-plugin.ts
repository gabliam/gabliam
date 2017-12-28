import {
  Scan,
  Registry,
  Plugin,
  GabliamPlugin,
  ValueRegistry,
  Container
} from '@gabliam/core';
import { TYPE, ENTITIES_TYPEORM } from './constant';
import { ConnectionManager } from './connection-manager';

@Plugin()
@Scan()
export class TypeOrmPlugin implements GabliamPlugin {
  bind(container: Container, registry: Registry) {
    const entities = registry
      .get<ValueRegistry>(TYPE.Entity)
      .map(({ target }) => {
        return target;
      });
    container.bind<any>(ENTITIES_TYPEORM).toConstantValue(entities);
  }

  async destroy(container: Container, registry: Registry) {
    const connection = container.get(ConnectionManager);
    await connection.close();
  }
}
