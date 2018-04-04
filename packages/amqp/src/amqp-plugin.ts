import {
  Scan,
  Container,
  Registry,
  Plugin,
  GabliamPlugin
} from '@gabliam/core';
import { TYPE, METADATA_KEY } from './constants';
import { RabbitHandlerMetadata } from './interfaces';
import * as d from 'debug';
import { AmqpConnectionManager } from './amqp-manager';

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
    const connectionManager = container.get(AmqpConnectionManager);
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
          const cunit = <string>Reflect.getMetadata(
            METADATA_KEY.cunit,
            controller.constructor
          );
          if (cunit) {
            connectionManager
              .getConnection(cunit)
              .constructAndAddConsume(handlerMetadata, controller);
          } else {
            connectionManager
              .getDefaultConnection()
              .constructAndAddConsume(handlerMetadata, controller);
          }
        });
      }
    });
  }

  async start(container: Container, registry: Registry) {
    const connection = container.get(AmqpConnectionManager);
    await connection.start();
  }

  async stop(container: Container, registry: Registry) {
    const connection = container.get(AmqpConnectionManager);
    await connection.stop();
  }
}
