import {
  Scan,
  Registry,
  Plugin,
  GabliamPlugin,
  ValueRegistry,
  Container
} from '@gabliam/core';
import { Connection } from './typeorm';
import { TYPE, ENTITIES_PATH } from './constant';

@Plugin()
@Scan()
export class TypeOrmPlugin implements GabliamPlugin {
  bind(container: Container, registry: Registry) {
    const entitiesPaths = registry
      .get<ValueRegistry>(TYPE.Entity)
      .map(({ target }) => {
        return target;
      });
    container.bind<any>(ENTITIES_PATH).toConstantValue(entitiesPaths);
  }

  async destroy(container: Container, registry: Registry) {
    const connection = container.get<Connection>(Connection);
    await connection.close();
  }
}
