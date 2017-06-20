import { ConsumeOptions, SendOptions } from './amqp';

export type HandlerType = 'Listener' | 'Consumer';

export interface RabbitHandlerMetadata {
  queue: string;

  type: HandlerType;

  consumeOptions?: ConsumeOptions;

  sendOptions?: SendOptions;

  sendOptionsError?: SendOptions;

  key: string;
}
