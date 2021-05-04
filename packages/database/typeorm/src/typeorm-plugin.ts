/* eslint-disable max-classes-per-file */
import {
  Container,
  GabliamPlugin,
  Plugin,
  Registry,
  Scan,
  ValueRegistry,
} from '@gabliam/core';
import { ConnectionManager } from './connection-manager';
import {
  ENTITIES_TYPEORM,
  MIGRATIONS_TYPEORM,
  SUBSCRIBERS_TYPEORM,
  TYPE,
} from './constant';
import { ContainedType, ContainerInterface, useContainer } from './typeorm';

/**
 * Container to be used by this library for inversion control. If container was not implicitly set then by default
 * container simply creates a new instance of the given class.
 */
const defaultContainer: ContainerInterface = new (class
  implements ContainerInterface {
  public instances: { type: Function; object: any }[] = [];

  get<T>(someClass: ContainedType<T>): T {
    let instance = this.instances.find((i) => i.type === someClass);
    if (!instance) {
      instance = { type: someClass, object: new (someClass as new () => T)() };
      this.instances.push(instance);
    }

    return instance.object;
  }
})();

useContainer(defaultContainer);

@Plugin(undefined, true)
@Scan()
export class TypeOrmPlugin implements GabliamPlugin {
  async start(container: Container) {
    const connection = container.get(ConnectionManager);
    await connection.open();
  }

  bind(container: Container, registry: Registry) {
    const entities = registry
      .get<ValueRegistry>(TYPE.Entity)
      .map(({ target }) => target);
    container.bind<any>(ENTITIES_TYPEORM).toConstantValue(entities);

    const migrations = registry
      .get<ValueRegistry>(TYPE.Migration)
      .map(({ target }) => target);
    container.bind<any>(MIGRATIONS_TYPEORM).toConstantValue(migrations);

    const subscribers = registry
      .get<ValueRegistry>(TYPE.EventSubscriber)
      .map(({ target }) => target);
    container.bind<any>(SUBSCRIBERS_TYPEORM).toConstantValue(subscribers);
  }

  async destroy(container: Container) {
    const connection = container.get(ConnectionManager);
    await connection.close();
    (<any>defaultContainer).instances = [];
  }
}
