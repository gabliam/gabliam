import { ValueExtractor } from '@gabliam/core';
import * as amqp from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage, Message } from 'amqplib';
import * as PromiseB from 'bluebird';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import { DEFAULT_PARAM_VALUE, PARAMETER_TYPE } from './constants';
import { AmqpConnectionError, AmqpTimeoutError } from './errors';
import {
  ConsumeConfig,
  ConsumeOptions,
  ConsumerHandler,
  Controller,
  ParameterMetadata,
  RabbitHandlerMetadata,
  SendOptions,
} from './interfaces';
import { Queue } from './queue';
import { log4js } from '@gabliam/log4js';

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
  private logger = log4js.getLogger(AmqpConnection.name);

  private state = ConnectionState.stopped;

  private connection: amqp.AmqpConnectionManager;

  private channel: amqp.ChannelWrapper;

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
    this.connection = amqp.connect([this.url]);
    this.channel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        for (const queue of this.queues) {
          await channel.assertQueue(queue.queueName, queue.queueOptions);
        }
        for (const { queueName, handler, options } of this.consumerList) {
          await channel.consume(queueName, handler, options);
        }
      },
    });

    return new Promise((resolve, reject) => {
      this.connection.once('disconnect', (err: any) => {
        if (_.get(err, 'err.errno', undefined) === 'ENOTFOUND') {
          this.connection.close();
          this.channel.removeAllListeners('connect');
          this.channel.removeAllListeners('error');
          reject(err.err);
        } else {
          this.logger.error(`Amqp error %O`, err);
        }
      });

      this.state = ConnectionState.running;
      const isConnect = () => {
        this.connection.removeAllListeners('disconnect');
        resolve();
      };
      this.channel.once('connect', isConnect);
      this.channel.once('error', isConnect);
    });
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
    const channel = this.getChannel();
    if (channel === null) {
      throw new AmqpConnectionError('Connection error');
    }
    await channel.sendToQueue(
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
    msg: Message,
    options?: SendOptions
  ) {
    const queueName = this.getQueueName(queue);
    const channel = this.getChannel();
    if (channel === null) {
      throw new AmqpConnectionError('Connection error');
    }
    await channel.sendToQueue(
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
      const chan = this.getChannel();
      if (chan === null) {
        return reject(new AmqpConnectionError('Connection error'));
      }
      // create new Queue for get the response
      chan
        .assertQueue(replyTo, { exclusive: true, autoDelete: true })
        .then(() => {
          return chan.consume(replyTo, (msg: ConsumeMessage | null) => {
            if (msg === null) {
              return reject(new Error('Message is null'));
            }
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
          (err: any) => {
            reject(err);
          }
        );
    });

    if (timeout) {
      promise = promise.timeout(timeout).catch(PromiseB.TimeoutError, e => {
        onTimeout = true;
        throw new AmqpTimeoutError((<any>e).message);
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

    try {
      this.channel.removeAllListeners('connect');
      this.channel.removeAllListeners('error');
      await this.connection.close();
    } catch {}

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
  parseContent(msg: Message) {
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
    return async (msg: ConsumeMessage | null) => {
      if (msg === null) {
        return;
      }

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
    return async (msg: Message | null) => {
      if (msg === null) {
        return;
      }

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

  private extractArgs(params: ParameterMetadata[], msg: Message): any[] {
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

  private getChannel(): ConfirmChannel | null {
    return (<any>this.channel)._channel;
  }
}
