/* eslint-disable @typescript-eslint/no-redeclare */
import {
  injectable,
  makeDecorator,
  makePropDecorator,
  Register,
} from '@gabliam/core';
import { ERRORS_MSGS, METADATA_KEY, TYPE } from '../constants';
import {
  ConsumeOptions,
  RabbitHandlerOptions,
  SendOptions,
} from '../interfaces';

export type HandlerType = 'Listener' | 'Consumer';

/**
 * Type of the `RabbitController` decorator / constructor function.
 */
export interface RabbitControllerDecorator {
  /**
   * Decorator that marks a class to be registred in amqp
   *
   * @usageNotes
   *
   * ```typescript
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Message() msg: MessageAmqp) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   */
  (): ClassDecorator;

  /**
   * see the `@Message` decorator.
   */
  new (): any;
}

export const RabbitController: RabbitControllerDecorator = makeDecorator(
  METADATA_KEY.RabbitController,
  undefined,
  (cls) => {
    injectable()(cls);
    Register({ type: TYPE.RabbitController, id: cls })(cls);
  },
  true,
  ERRORS_MSGS.DUPLICATED_CONTROLLER_DECORATOR,
);

export interface RabbitHandler {
  queue: string;

  type: HandlerType;

  consumeOptions?: ConsumeOptions;

  sendOptions?: SendOptions;

  sendOptionsError?: SendOptions;
}

/**
 * Type of the `RabbitListener` decorator / constructor function.
 */
export interface RabbitListenerDecorator {
  /**
   /**
   * Decorator that marks a class field as a RabbitListener property and
   * supplies configuration metadata.
   *
   * Registered the method as a consumer. This method cannot reply.
   *
   * @usageNotes
   *
   * ```typescript
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitListener('test')
   *    hello(@Message() msg: MessageAmqp) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   *
   */
  (queue: string, options?: RabbitHandlerOptions): MethodDecorator;

  /**
   * see the `@RabbitListener` decorator.
   */
  new (queue: string, options?: RabbitHandlerOptions): any;
}

/**
 * Type of metadata for an `RabbitListener` property.
 */
export interface RabbitListener extends RabbitHandler {
  type: 'Listener';
}

export const RabbitListener: RabbitListenerDecorator = makePropDecorator(
  METADATA_KEY.RabbitHandler,
  (queue: string, options?: RabbitHandlerOptions): RabbitListener => ({
    queue,
    ...options,
    type: 'Listener',
  }),
);

/**
 * Type of the `RabbitConsumer` decorator / constructor function.
 */
export interface RabbitConsumerDecorator {
  /**
   /**
   * Decorator that marks a class field as a RabbitConsumer property and
   * supplies configuration metadata.
   *
   * Registered the method as a consumer. This method cannot reply.
   *
   * @usageNotes
   *
   * ```typescript
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Message() msg: MessageAmqp) {
   *      console.log('Hello');
   *      return 'hi';
   *    }
   * }
   * ```
   *
   */
  (queue: string, options?: RabbitHandlerOptions): MethodDecorator;

  /**
   * see the `@RabbitConsumer` decorator.
   */
  new (queue: string, options?: RabbitHandlerOptions): any;
}

/**
 * Type of metadata for an `RabbitConsumer` property.
 */
export interface RabbitConsumer extends RabbitHandler {
  type: 'Consumer';
}

export const RabbitConsumer: RabbitListenerDecorator = makePropDecorator(
  METADATA_KEY.RabbitHandler,
  (queue: string, options?: RabbitHandlerOptions): RabbitConsumer => ({
    queue,
    ...options,
    type: 'Consumer',
  }),
);
