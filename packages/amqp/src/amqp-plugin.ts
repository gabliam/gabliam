import {
  Scan,
  Container,
  Registry,
  Plugin,
  GabliamPlugin
} from '@gabliam/core';
import { TYPE, METADATA_KEY } from './constants';
import { RabbitHandlerMetadata } from './interfaces';
import { AmqpConnection } from './amqp-connection';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:AmqpPlugin');

@Plugin()
@Scan()
export class AmqpPlugin implements GabliamPlugin {
  /**
   * binding phase
   *
   * Bind all controller and bind express app
   * @param  {Container} container
   * @param  {Registry} registry
   */
  bind(container: Container, registry: Registry) {
    debug('bind AmqpPlugin');
    registry.get(TYPE.RabbitController).forEach(({ id, target }) =>
      container
        .bind(id)
        .to(target)
        .inSingletonScope()
    );
  }

  build(container: Container, registry: Registry) {
    debug('build AmqpPlugin');
    const controllerIds = registry.get(TYPE.RabbitController);
    const connection = container.get(AmqpConnection);
    debug('controllerIds', controllerIds, container);
    controllerIds.forEach(({ id: controllerId }) => {
      const controller = container.get<any>(controllerId);
      debug('controller', controller);

      const handlerMetadatas: RabbitHandlerMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.RabbitHandler,
        controller.constructor
      );

      if (handlerMetadatas) {
        handlerMetadatas.forEach(handlerMetadata => {
          connection.constructAndAddConsume(handlerMetadata, controller);
        });
      }
    });
  }

  async start(container: Container, registry: Registry) {
    const connection = container.get(AmqpConnection);
    await connection.start();
  }

  async stop(container: Container, registry: Registry) {
    const connection = container.get(AmqpConnection);
    await connection.stop();
  }
}
