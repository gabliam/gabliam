import amqp = require('amqplib');

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
  chan: amqp.Channel
) => (msg: Message) => void | Promise<void>;

export type Handler = (content: any) => any | Promise<any>;

export interface Controller {
  [k: string]: Handler;
}

export interface MessageFields {
  consumerTag: string;
  deliveryTag: number;
  redelivered: boolean;
  exchange: string;
  routingKey: string;
}

export interface Message {
  content: Buffer;

  properties: SendOptions;

  fields: MessageFields;
}

export interface ConsumeOptions {
  /**
   * a name which the server will use to distinguish message deliveries for the consumer;
   * mustn't be already in use on the channel
   * It's usually easier to omit this, in which case the server will create a random name and supply it in the reply.
   */
  consumerTag?: string;

  /**
   * in theory, if true then the broker won't deliver messages to the consumer if they were also published on this connection;
   * RabbitMQ doesn't implement it though, and will ignore it. Defaults to false.
   */
  noLocal?: boolean;

  /**
   * if true, the broker won't expect an acknowledgement of messages delivered to this consumer;
   * i.e., it will dequeue messages as soon as they've been sent down the wire.
   * Defaults to false (i.e., you will be expected to acknowledge messages).
   */
  noAck?: boolean;

  /**
   * if true, the broker won't let anyone else consume from this queue;
   * if there already is a consumer, there goes your channel
   * (so usually only useful if you've made a 'private' queue by letting the server choose its name).
   */
  exclusive?: boolean;

  /**
   *  gives a priority to the consumer; higher priority consumers get messages in preference to lower priority consumers.
   * See this RabbitMQ extension's documentation
   */
  priority?: number;

  /**
   * arbitrary arguments. Go to town.
   */
  arguments?: object;
}

export interface SendOptions {
  /**
   * if supplied, the message will be discarded from a queue once
   * it's been there longer than the given number of milliseconds.
   * In the specification this is a string; numbers supplied here will be coerced to strings for transit.
   */
  expiration?: string;

  /**
   * If supplied, RabbitMQ will compare it to the username supplied when opening the connection,
   * and reject messages for which it does not match.
   */
  userId?: string;

  /**
   * an array of routing keys as strings;
   * messages will be routed to these routing keys in addition to that given as the routingKey parameter.
   * A string will be implicitly treated as an array containing just that string.
   * This will override any value given for CC in the headers parameter. NB The property names CC and BCC are case-sensitive.
   */
  CC?: string | string[];

  /**
   * a priority for the message; ignored by versions of RabbitMQ older than 3.5.0,
   * or if the queue is not a priority queue (see maxPriority above).
   */
  priority?: number;

  /**
   * If truthy, the message will survive broker restarts provided it's in a queue that also survives restarts.
   * Corresponds to, and overrides, the property deliveryMode.
   */
  persistent?: boolean;

  /**
   * Either 1 or falsey, meaning non-persistent; or, 2 or truthy, meaning persistent.
   * That's just obscure though. Use the option persistent instead.
   */
  deliveryMode?: boolean | 1 | 2;

  /****************************************
   * Used by RabbitMQ but not sent on to consumers:
   ****************************************/

  /**
   * if true, the message will be returned if it is not routed to a queue (i.e., if there are no bindings that match its routing key).
   */
  mandatory?: boolean;

  /**
   * like CC, except that the value will not be sent in the message headers to consumers.
   */
  BCC?: string | string[];

  /****************************************
   * Not used by RabbitMQ and not sent to consumers:
   ****************************************/

  /**
   * in the specification, this instructs the server to return the message if it is not able to be sent immediately to a consumer.
   * No longer implemented in RabbitMQ, and if true, will provoke a channel error, so it's best to leave it out.
   * Ignored by RabbitMQ (but may be useful for applications)
   */
  immediate?: boolean;

  /**
   * a MIME type for the message content
   */
  contentType?: string;

  /**
   * a MIME encoding for the message content
   */
  contentEncoding?: string;

  /**
   * application specific headers to be carried along with the message content.
   * The value as sent may be augmented by extension-specific fields if they are given in the parameters, for example,
   * 'CC', since these are encoded as message headers; the supplied value won't be mutated
   */
  headers?: object;

  /**
   * usually used to match replies to requests, or similar
   */
  correlationId?: string;

  /**
   * often used to name a queue to which the receiving application must send replies,
   * in an RPC scenario (many libraries assume this pattern)
   */
  replyTo?: string;

  /**
   * arbitrary application-specific identifier for the message
   */
  messageId?: string;

  /**
   * a timestamp for the message
   */
  timestamp?: number;

  /**
   * an arbitrary application-specific type for the message
   */
  type?: string;

  /**
   * an arbitrary identifier for the originating application
   */
  appId?: string;
}

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
