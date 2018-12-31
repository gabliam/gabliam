import { reflection, ValueExtractor } from '@gabliam/core';
import { log4js } from '@gabliam/log4js';
import * as amqp from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage, Message } from 'amqplib';
import * as PromiseB from 'bluebird';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import { AmqpConnectionError, AmqpTimeoutError } from './errors';
import {
  ConsumeConfig,
  ConsumeOptions,
  ConsumerHandler,
  Controller,
  SendOptions,
} from './interfaces';
import { RabbitHandler, RabbitParamDecorator } from './metadatas';
import { Queue } from './queue';

type ExtractArgsFn = (msg: Message) => any;

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

  private extractArgs: { [k: string]: ExtractArgsFn } = {};

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
          /* istanbul ignore next */
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
    propKey: string,
    handlerMetadata: RabbitHandler,
    controller: Controller
  ) {
    let consumeHandler: ConsumerHandler;
    if (handlerMetadata.type === 'Listener') {
      consumeHandler = this.constructListener(propKey, controller);
    } else {
      consumeHandler = this.constructConsumer(
        propKey,
        handlerMetadata,
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
      /* istanbul ignore next */
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
      /* istanbul ignore next */
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
        /* istanbul ignore next */
        return reject(new AmqpConnectionError('Connection error'));
      }
      // create new Queue for get the response
      chan
        .assertQueue(replyTo, { exclusive: true, autoDelete: true })
        .then(() => {
          return chan.consume(replyTo, (msg: ConsumeMessage | null) => {
            if (msg === null) {
              /* istanbul ignore next */
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

    if (content instanceof Error) {
      return new Buffer(
        JSON.stringify(content, Object.getOwnPropertyNames(content))
      );
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
    propKey: string,
    controller: Controller
  ): ConsumerHandler {
    return async (msg: ConsumeMessage | null) => {
      /* istanbul ignore next */
      if (msg === null) {
        return;
      }

      const extractArgs = this.getExtractArgs(propKey, controller);

      const args = extractArgs(msg);
      await Promise.resolve(controller[propKey](...args));
      await this.channel.ack(msg);
    };
  }

  private constructConsumer(
    propKey: string,
    handlerMetadata: RabbitHandler,
    controller: Controller
  ): ConsumerHandler {
    return async (msg: Message | null) => {
      if (msg === null) {
        /* istanbul ignore next */
        return;
      }

      // catch when error amqp (untestable)
      /* istanbul ignore next */
      if (msg.properties.replyTo === undefined) {
        throw new Error(`replyTo is missing`);
      }
      const extractArgs = this.getExtractArgs(propKey, controller);
      const args = extractArgs(msg);

      let response: any;
      let sendOptions: SendOptions;
      try {
        response = await Promise.resolve(controller[propKey](...args));
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

  private getExtractArgs(propKey: string, controller: Controller) {
    const k = `${controller.constructor.name}#${propKey}`;
    if (this.extractArgs[k]) {
      return this.extractArgs[k];
    }

    const params = reflection.parameters(<any>controller.constructor, propKey);

    if (
      params.length === 1 &&
      Array.isArray(params[0]) &&
      params[0].length === 0
    ) {
      return (this.extractArgs[k] = msg => [this.parseContent(msg)]);
    }

    const parameters: RabbitParamDecorator[] = params.map(
      meta => meta.slice(-1)[0]
    );

    return (this.extractArgs[k] = msg => {
      const content = this.parseContent(msg);
      return parameters.map(p => p.handler(p.args, msg, content));
    });
  }

  private getChannel(): ConfirmChannel | null {
    return (<any>this.channel)._channel;
  }
}
