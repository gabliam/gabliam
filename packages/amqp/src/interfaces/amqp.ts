import { ConsumeMessage, Options } from 'amqplib';

export interface QueueOptions {
  /**
   * if true, scopes the queue to the connection (defaults to false)
   */
  exclusive: boolean;

  /**
   * if true, the queue will survive broker restarts,
   * modulo the effects of exclusive and autoDelete;
   * this defaults to true if not supplied, unlike the others
   */
  durable: boolean;

  /**
   * if true, the queue will be deleted when the number of consumers drops to zero (defaults to false)
   */
  autoDelete: boolean;

  /**
   * RabbitMQ extensions can also be supplied as options.
   * These typically require non-standard x-* keys and values, sent in the arguments table; e.g., 'x-expires'.
   * When supplied in options, the x- prefix for the key is removed; e.g., 'expires'.
   * Values supplied in options will overwrite any analogous field you put in options.arguments.
   */
  arguments?: { [name: string]: string };
}

export interface QueueConfiguration {
  queueName: string;

  options: QueueOptions;
}

export type ConsumerHandler = (
  msg: ConsumeMessage | null
) => void | Promise<void>;

export type Handler = (...args: any[]) => any | Promise<any>;

export interface Controller {
  [k: string]: Handler;
}

export type ConsumeOptions = Options.Consume;

export type SendOptions = Options.Publish;

export interface RabbitHandlerOptions {
  consumeOptions?: ConsumeOptions;

  sendOptions?: SendOptions;

  sendOptionsError?: SendOptions;
}

export interface ConsumeConfig {
  queueName: string;
  handler: ConsumerHandler;
  options?: ConsumeOptions;
}

export interface QueueDictionnary {
  [k: string]: QueueConfiguration;
}

/**
 * Configuration for a connection
 */
export interface ConnectionConfig {
  /**
   * Name of the connection
   */
  name: string;

  /**
   * Url of the connection
   */
  url: string;

  /**
   * Value passed to rabbitmq for an undefined value
   * amqplib can not send an undefined value because the lib uses Buffer
   *
   */
  undefinedValue: string;

  queues: QueueDictionnary;
}
