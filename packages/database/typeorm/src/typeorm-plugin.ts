import {
  Scan,
  Registry,
  Plugin,
  GabliamPlugin,
  ValueRegistry,
  Container,
} from '@gabliam/core';
import { TYPE, ENTITIES_TYPEORM } from './constant';
import { ConnectionManager } from './connection-manager';
import { ContainerInterface, ContainedType, useContainer } from './typeorm';

/**
 * Container to be used by this library for inversion control. If container was not implicitly set then by default
 * container simply creates a new instance of the given class.
 */
const defaultContainer: ContainerInterface = new class
  implements ContainerInterface {
  public instances: { type: Function; object: any }[] = [];

  get<T>(someClass: ContainedType<T>): T {
    let instance = this.instances.find(i => i.type === someClass);
    if (!instance) {
      instance = { type: someClass, object: new (someClass as new () => T)() };
      this.instances.push(instance);
    }

    return instance.object;
  }
}();

useContainer(defaultContainer);

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
    (<any>defaultContainer).instances = [];
  }
}
