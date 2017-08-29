import amqp = require('amqplib');
import {
  interfaces as coreInterfaces,
  Scan,
  inversifyInterfaces,
  Registry,
  Plugin
} from '@gabliam/core';
import { TYPE, METADATA_KEY } from './constants';
import {
  RabbitHandlerMetadata,
  ConsumerHandler,
  Message,
  SendOptions,
  Controller
} from './interfaces';
import { AmqpConnection } from './amqp-connection';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:AmqpPlugin');

@Plugin()
@Scan()
export class AmqpPlugin implements coreInterfaces.GabliamPlugin {
  /**
   * binding phase
   *
   * Bind all controller and bind express app
   * @param  {inversifyInterfaces.Container} container
   * @param  {Registry} registry
   */
  bind(container: inversifyInterfaces.Container, registry: Registry) {
    debug('bind AmqpPlugin');
    registry.get(TYPE.RabbitController).forEach(({ id, target }) =>
      container
        .bind(id)
        .to(target)
        .inSingletonScope()
    );
  }

  build(container: inversifyInterfaces.Container, registry: Registry) {
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
          let consumeHandler: ConsumerHandler;
          if (handlerMetadata.type === 'Listener') {
            consumeHandler = this.constructListener(
              handlerMetadata,
              container,
              controllerId
            );
          } else {
            consumeHandler = this.constructConsumer(
              handlerMetadata,
              container,
              controllerId
            );
          }

          connection.addConsume(
            handlerMetadata.queue,
            consumeHandler,
            handlerMetadata.consumeOptions
          );
        });
      }
    });
  }

  async start(container: inversifyInterfaces.Container, registry: Registry) {
    const connection = container.get(AmqpConnection);
    await connection.start();
  }

  async stop(container: inversifyInterfaces.Container, registry: Registry) {
    const connection = container.get(AmqpConnection);
    await connection.stop();
  }

  private constructListener(
    handlerMetadata: RabbitHandlerMetadata,
    container: inversifyInterfaces.Container,
    controllerId: any
  ): ConsumerHandler {
    return (chan: amqp.Channel) => async (msg: Message) => {
      const connection = container.get(AmqpConnection);
      const controller = container.get<Controller>(controllerId);
      const content = connection.parseContent(msg);
      await Promise.resolve(controller[handlerMetadata.key](content));
      await chan.ack(msg);
    };
  }

  private constructConsumer(
    handlerMetadata: RabbitHandlerMetadata,
    container: inversifyInterfaces.Container,
    controllerId: any
  ): ConsumerHandler {
    return (chan: amqp.Channel) => async (msg: Message) => {
      // catch when error amqp (untestable)
      /* istanbul ignore next */
      if (msg.properties.replyTo === undefined) {
        throw new Error(`replyTo is missing`);
      }

      const connection = container.get(AmqpConnection);
      const controller = container.get<Controller>(controllerId);
      const content = connection.parseContent(msg);

      let response: any;
      let sendOptions: SendOptions;
      try {
        response = await Promise.resolve(
          controller[handlerMetadata.key](content)
        );
        sendOptions = handlerMetadata.sendOptions || {};
      } catch (err) {
        response = err;
        sendOptions = handlerMetadata.sendOptionsError || {};
      }

      connection.sendToQueueAck(msg.properties.replyTo, response, msg, {
        correlationId: msg.properties.correlationId,
        contentType: 'application/json',
        ...sendOptions
      });
    };
  }
}
