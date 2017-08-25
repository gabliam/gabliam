import {
  interfaces,
  Scan,
  inversifyInterfaces,
  Registry,
  Plugin
} from '@gabliam/core';
import { Connection } from './typeorm';
import { TYPE, ENTITIES_PATH } from './constant';

@Plugin()
@Scan()
export class TypeOrmPlugin implements interfaces.GabliamPlugin {
  bind(container: inversifyInterfaces.Container, registry: Registry) {
    const entitiesPaths = registry
      .get<interfaces.ValueRegistry>(TYPE.Entity)
      .map(({ target }) => {
        return target;
      });
    container.bind<any>(ENTITIES_PATH).toConstantValue(entitiesPaths);
  }

  async destroy(container: inversifyInterfaces.Container, registry: Registry) {
    const connection = container.get<Connection>(Connection);
    await connection.close();
  }
}
