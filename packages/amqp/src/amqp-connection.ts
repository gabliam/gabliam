import amqp = require('amqplib');
import { Queue } from './queue';
import { ValueExtractor } from '@gabliam/core';
import {
  ConsumerHandler,
  ConsumeOptions,
  SendOptions,
  AmqpMessage,
  ConsumeConfig,
  RabbitHandlerMetadata,
  Controller,
  ParameterMetadata,
} from './interfaces';
import * as uuid from 'uuid';
import * as PromiseB from 'bluebird';
import { AmqpTimeout } from './errors';
import { PARAMETER_TYPE, DEFAULT_PARAM_VALUE } from './constants';

enum ConnectionState {
  stopped,

  running,

  starting,

  stopping,
}

/**
 * Amqp Connection
 */
export class AmqpConnection {
  private connection!: amqp.Connection;

  private channel!: amqp.Channel;

  private state = ConnectionState.stopped;

  private consumerList: ConsumeConfig[] = [];

  constructor(
    public indexConfig: number,
    public name: string,
    private url: string,
    private undefinedValue: string,
    private queues: Queue[],
    private valueExtractor: ValueExtractor
  ) {}

  /**
   * Start the connection
   */
  async start() {
    if (this.state !== ConnectionState.stopped) {
      return;
    }

    this.state = ConnectionState.starting;
    this.connection = await amqp.connect(this.url);
    const ch = (this.channel = await this.connection.createChannel());
    for (const queue of this.queues) {
      await ch.assertQueue(queue.queueName, queue.queueOptions);
    }

    for (const { queueName, handler, options } of this.consumerList) {
      await ch.consume(queueName, handler, options);
    }

    this.state = ConnectionState.running;
  }

  /**
   * Add a consumer for a queue
   */
  addConsume(
    queue: string,
    handler: ConsumerHandler,
    options?: ConsumeOptions
  ) {
    const queueName = this.getQueueName(queue);
    if (!this.queueExist(queueName)) {
      throw new Error(`queue "${queueName}" doesn't exist`);
    }
    this.consumerList.push({ queueName, handler, options });
  }

  /**
   * contrust consumer with controller instance and HandlerMetadata
   */
  constructAndAddConsume(
    handlerMetadata: RabbitHandlerMetadata,
    parameterMetadata: ParameterMetadata[],
    controller: Controller
  ) {
    let consumeHandler: ConsumerHandler;
    if (handlerMetadata.type === 'Listener') {
      consumeHandler = this.constructListener(
        handlerMetadata,
        parameterMetadata,
        controller
      );
    } else {
      consumeHandler = this.constructConsumer(
        handlerMetadata,
        parameterMetadata,
        controller
      );
    }

    this.addConsume(
      handlerMetadata.queue,
      consumeHandler,
      handlerMetadata.consumeOptions
    );
  }

  /**
   * Send a content to a queue.
   * Content can be undefined
   */
  async sendToQueue(queue: string, content: any, options?: SendOptions) {
    const queueName = this.getQueueName(queue);
    await this.channel.sendToQueue(
      queueName,
      this.contentToBuffer(content),
      options
    );
  }

  /**
   * Send a content to a queue and Ack the message
   * Content can be undefined
   */
  async sendToQueueAck(
    queue: string,
    content: any,
    msg: AmqpMessage,
    options?: SendOptions
  ) {
    const queueName = this.getQueueName(queue);
    await this.channel.sendToQueue(
      queueName,
      this.contentToBuffer(content),
      options
    );
    await this.channel.ack(msg);
  }

  /**
   * Basic RPC pattern with conversion.
   * Send a Javascrip object converted to a message to a queue and attempt to receive a response, converting that to a Java object.
   * Implementations will normally set the reply-to header to an exclusive queue and wait up for some time limited by a timeout.
   */
  async sendAndReceive<T = any>(
    queue: string,
    content: any,
    options: SendOptions = {},
    timeout: number = 5000
  ): Promise<T> {
    let onTimeout = false;
    let promise = new PromiseB<T>((resolve, reject) => {
      const queueName = this.getQueueName(queue);
      if (!options.correlationId) {
        options.correlationId = uuid();
      }
      const correlationId = options.correlationId;

      if (!options.replyTo) {
        options.replyTo = `amqpSendAndReceive${uuid()}`;
      }

      if (!options.expiration) {
        options.expiration = '' + timeout;
      }

      const replyTo = options.replyTo;
      const chan = this.channel;

      // create new Queue for get the response
      chan
        .assertQueue(replyTo, { exclusive: true, autoDelete: true })
        .then(() => {
          return chan.consume(replyTo, (msg: AmqpMessage) => {
            if (!onTimeout && msg.properties.correlationId === correlationId) {
              resolve(this.parseContent(msg));
            }
            chan.ack(msg);
          });
        })
        .then(() => {
          chan.sendToQueue(queueName, this.contentToBuffer(content), options);
        })
        // catch when error amqp (untestable)
        .catch(
          // prettier-ignore
          /* istanbul ignore next */
          (err) => {
            reject(err);
          }
        );
    });

    if (timeout) {
      promise = promise.timeout(timeout).catch(PromiseB.TimeoutError, e => {
        onTimeout = true;
        throw new AmqpTimeout((<any>e).message);
      });
    }

    return promise;
  }

  /**
   * Stop the connection
   */
  async stop() {
    if (this.state !== ConnectionState.running) {
      return;
    }
    this.state = ConnectionState.stopping;

    await this.channel.close();
    await this.connection.close();

    this.state = ConnectionState.stopped;
  }

  /**
   * Test if queue exist
   */
  queueExist(queueName: string) {
    for (const queue of this.queues) {
      if (queue.queueName === queueName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the real queueName
   *
   * Search if the queueName is the index of the map of queues => return queueName
   * Search if the queueName is a key value => return the value
   * else return the queue passed on parameter
   */
  getQueueName(queueName: string) {
    const defaultValue = this.valueExtractor(`"${queueName}"`, queueName);

    if (this.valueExtractor(`application.amqp[0] ? true : false`, false)) {
      return this.valueExtractor(
        `application.amqp[${
          this.indexConfig
        }].queues['${queueName}'].queueName`,
        defaultValue
      );
    } else {
      return this.valueExtractor(
        `application.amqp.queues['${queueName}'].queueName`,
        defaultValue
      );
    }
  }

  /**
   * Convert content to buffer for send in queue
   */
  contentToBuffer(content: any) {
    if (content === undefined) {
      return new Buffer(this.undefinedValue);
    }

    if (content instanceof Buffer) {
      return content;
    }

    if (typeof content === 'string') {
      return new Buffer(content);
    }

    return new Buffer(JSON.stringify(content));
  }

  /**
   * Parse content in message
   */
  parseContent(msg: AmqpMessage) {
    if (msg.content.toString() === this.undefinedValue) {
      return undefined;
    }

    try {
      return JSON.parse(msg.content.toString());
    } catch (e) {
      return msg.content.toString();
    }
  }

  private constructListener(
    handlerMetadata: RabbitHandlerMetadata,
    parametersMetadata: ParameterMetadata[],
    controller: Controller
  ): ConsumerHandler {
    return async (msg: AmqpMessage) => {
      const args = this.extractArgs(parametersMetadata, msg);
      await Promise.resolve(controller[handlerMetadata.key](...args));
      await this.channel.ack(msg);
    };
  }

  private constructConsumer(
    handlerMetadata: RabbitHandlerMetadata,
    parametersMetadata: ParameterMetadata[],
    controller: Controller
  ): ConsumerHandler {
    return async (msg: AmqpMessage) => {
      // catch when error amqp (untestable)
      /* istanbul ignore next */
      if (msg.properties.replyTo === undefined) {
        throw new Error(`replyTo is missing`);
      }

      const args = this.extractArgs(parametersMetadata, msg);

      let response: any;
      let sendOptions: SendOptions;
      try {
        response = await Promise.resolve(
          controller[handlerMetadata.key](...args)
        );
        sendOptions = handlerMetadata.sendOptions || {};
      } catch (err) {
        response = err;
        sendOptions = handlerMetadata.sendOptionsError || {};
      }

      this.sendToQueueAck(msg.properties.replyTo, response, msg, {
        correlationId: msg.properties.correlationId,
        contentType: 'application/json',
        ...sendOptions,
      });
    };
  }

  private extractArgs(params: ParameterMetadata[], msg: AmqpMessage): any[] {
    const args = [];
    const content = this.parseContent(msg);

    if (!params || !params.length) {
      return [content];
    }

    for (const item of params) {
      switch (item.type) {
        case PARAMETER_TYPE.MESSAGE:
          args[item.index] = msg;
          break;
        case PARAMETER_TYPE.CONTENT:
          args[item.index] = this.getParam(content, null, item);
          break;
        case PARAMETER_TYPE.PROPERTIES:
          args[item.index] = this.getParam(msg, 'properties', item);
          break;
        case PARAMETER_TYPE.FIELDS:
          args[item.index] = this.getParam(msg, 'fields', item);
          break;
        default:
          args[item.index] = msg;
          break; // response
      }
    }

    args.push(content);
    return args;
  }

  private getParam(
    source: any,
    paramType: string | null,
    itemParam: ParameterMetadata
  ) {
    const name = itemParam.parameterName;

    // get the param source
    let param = source;
    if (paramType !== null && source[paramType]) {
      param = source[paramType];
    }

    const res = param[name];

    if (res !== undefined) {
      return res;
    } else {
      return name === DEFAULT_PARAM_VALUE ? param : undefined;
    }
  }
}
