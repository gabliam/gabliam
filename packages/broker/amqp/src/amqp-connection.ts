import { reflection, toPromise, ValueExtractor } from '@gabliam/core';
import { log4js } from '@gabliam/log4js';
import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage, Message } from 'amqplib';
import PromiseB from 'bluebird';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { gunzip, gzip } from 'zlib';
import {
  AmqpConnectionError,
  AmqpMessageIsNullError,
  AmqpQueueDoesntExistError,
  AmqpReplytoIsMissingError,
  AmqpTimeoutError,
} from './errors';
import {
  ConsumeConfig,
  ConsumeOptions,
  ConsumerHandler,
  Controller,
  SendOptions,
} from './interfaces';
import { RabbitHandler, RabbitParamDecorator } from './metadatas';
import { Queue } from './queue';

type ExtractArgsFn = (msg: Message) => Promise<any>;

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

  private connection: AmqpConnectionManager;

  private channel: ChannelWrapper;

  private consumerList: ConsumeConfig[] = [];

  private extractArgs: { [k: string]: ExtractArgsFn } = {};

  constructor(
    public indexConfig: number,
    public name: string,
    private url: string,
    private undefinedValue: string,
    private queues: Queue[],
    private valueExtractor: ValueExtractor,
    private gzipEnabled: boolean,
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
          // eslint-disable-next-line no-await-in-loop
          await channel.assertQueue(queue.queueName, queue.queueOptions);
        }
        for (const { queueName, handler, options } of this.consumerList) {
          // eslint-disable-next-line no-await-in-loop
          await channel.consume(queueName, handler, options);
        }
      },
    });

    await new Promise<void>((resolve, reject) => {
      const onConnectFailed = (err: any) => {
        if (
          _.get(err, 'err.errno', undefined) === 'ENOTFOUND' ||
          _.get(err, 'err.code', undefined) === 'ENOTFOUND'
        ) {
          this.channel.removeAllListeners('connect');
          this.channel.removeAllListeners('error');
          reject(err.err);
        } else {
          /* istanbul ignore next */
          this.logger.error(`Amqp error %O`, err);
        }
      };
      this.connection.once('connectFailed', onConnectFailed);

      this.state = ConnectionState.running;
      const isConnect = () => {
        this.connection.removeListener('connectFailed', onConnectFailed);
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
    options?: ConsumeOptions,
  ) {
    const queueName = this.getQueueName(queue);
    if (!this.queueExist(queueName)) {
      throw new AmqpQueueDoesntExistError(queueName);
    }
    this.consumerList.push({ queueName, handler, options });
  }

  /**
   * contrust consumer with controller instance and HandlerMetadata
   */
  constructAndAddConsume(
    propKey: string,
    handlerMetadata: RabbitHandler,
    controller: Controller,
  ) {
    let consumeHandler: ConsumerHandler;
    if (handlerMetadata.type === 'Listener') {
      consumeHandler = this.constructListener(propKey, controller);
    } else {
      consumeHandler = this.constructConsumer(
        propKey,
        handlerMetadata,
        controller,
      );
    }

    this.addConsume(
      handlerMetadata.queue,
      consumeHandler,
      handlerMetadata.consumeOptions,
    );
  }

  /**
   * Send a content to a queue.
   * Content can be undefined
   */
  async sendToQueue(queue: string, content: any, options?: SendOptions) {
    const queueName = this.getQueueName(queue);
    const channel = this.getChannel();
    await channel.sendToQueue(queueName, await this.contentToBuffer(content), {
      contentEncoding: this.gzipEnabled ? 'gzip' : undefined,
      contentType: 'application/json',
      ...options,
    });
  }

  /**
   * Send a content to a queue and Ack the message
   * Content can be undefined
   */
  async sendToQueueAck(
    queue: string,
    content: any,
    msg: Message,
    options?: SendOptions,
  ) {
    const queueName = this.getQueueName(queue);
    const channel = this.getChannel();
    if (channel === null) {
      /* istanbul ignore next */
      throw new AmqpConnectionError();
    }
    await channel.sendToQueue(queueName, await this.contentToBuffer(content), {
      contentEncoding: this.gzipEnabled ? 'gzip' : undefined,
      contentType: 'application/json',
      ...options,
    });
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
    timeout = 5000,
  ): Promise<T> {
    let onTimeout = false;
    let chan: ConfirmChannel;
    let replyTo: string;
    let promise = new PromiseB<T>((resolve, reject) => {
      const queueName = this.getQueueName(queue);
      if (!options.correlationId) {
        // eslint-disable-next-line no-param-reassign
        options.correlationId = uuid();
      }
      const correlationId = options.correlationId;

      if (!options.replyTo) {
        // eslint-disable-next-line no-param-reassign
        options.replyTo = `amqpSendAndReceive${uuid()}`;
      }

      if (!options.expiration) {
        // eslint-disable-next-line no-param-reassign
        options.expiration = `${timeout}`;
      }

      replyTo = options.replyTo;
      chan = this.getChannel();

      // create new Queue for get the response
      chan
        .assertQueue(replyTo, {
          exclusive: false,
          autoDelete: true,
          durable: false,
        })
        .then(() =>
          chan.consume(replyTo, async (msg: ConsumeMessage | null) => {
            if (msg === null) {
              /* istanbul ignore next */
              reject(new AmqpMessageIsNullError());
              return;
            }
            if (!onTimeout && msg.properties.correlationId === correlationId) {
              resolve(await this.parseContent(msg));
            }
            chan.ack(msg);

            try {
              await chan.deleteQueue(replyTo);
              // eslint-disable-next-line no-empty
            } catch {}
          }),
        )
        .then(async () => {
          chan.sendToQueue(queueName, await this.contentToBuffer(content), {
            contentEncoding: this.gzipEnabled ? 'gzip' : undefined,
            contentType: 'application/json',
            ...options,
          });
        })
        // catch when error amqp (untestable)
        .catch(
          // prettier-ignore
          /* istanbul ignore next */
          async (err: any) => {
            reject(err);
            if (chan) {
              try {
                await chan.deleteQueue(replyTo);
              // eslint-disable-next-line no-empty
              } catch {}
            }
          },
        );
    });

    if (timeout) {
      promise = promise
        .timeout(timeout)
        .catch(PromiseB.TimeoutError, async (e) => {
          onTimeout = true;
          if (chan) {
            try {
              await chan.deleteQueue(replyTo);
              // eslint-disable-next-line no-empty
            } catch {}
          }
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
      // eslint-disable-next-line no-empty
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
        `application.amqp[${this.indexConfig}].queues['${queueName}'].queueName`,
        defaultValue,
      );
    }
    return this.valueExtractor(
      `application.amqp.queues['${queueName}'].queueName`,
      defaultValue,
    );
  }

  /**
   * Convert content to buffer for send in queue
   */
  async contentToBuffer(content: any) {
    let data: any;

    if (content === undefined) {
      data = this.undefinedValue;
    } else if (content instanceof Buffer) {
      data = content;
    } else if (typeof content === 'string') {
      data = content;
    } else if (content instanceof Error) {
      data = JSON.stringify(content, Object.getOwnPropertyNames(content));
    } else {
      data = JSON.stringify(content);
    }

    if (this.gzipEnabled) {
      return new Promise<Buffer>((resolve) => {
        gzip(Buffer.from(data), (err, res) => {
          if (err) {
            resolve(Buffer.from(''));
          } else {
            resolve(res);
          }
        });
      });
    }

    return Promise.resolve(Buffer.from(data));
  }

  /**
   * Parse content in message
   */
  async parseContent(msg: Message) {
    let data: any;
    if (this.gzipEnabled) {
      data = await new Promise<any>((resolve) => {
        gunzip(msg.content, (err, res) => {
          if (err) {
            resolve(msg.content.toString());
          } else {
            resolve(res.toString());
          }
        });
      });
    } else {
      data = msg.content.toString();
    }

    try {
      data = JSON.parse(data);
      // eslint-disable-next-line no-empty
    } catch {}

    if (data === this.undefinedValue) {
      return undefined;
    }

    return data;
  }

  private constructListener(
    propKey: string,
    controller: Controller,
  ): ConsumerHandler {
    return async (msg: ConsumeMessage | null) => {
      /* istanbul ignore next */
      if (msg === null) {
        return;
      }

      const extractArgs = this.getExtractArgs(propKey, controller);

      const args = await extractArgs(msg);
      await toPromise(controller[propKey](...args));
      await this.channel.ack(msg);
    };
  }

  private constructConsumer(
    propKey: string,
    handlerMetadata: RabbitHandler,
    controller: Controller,
  ): ConsumerHandler {
    return async (msg: Message | null) => {
      if (msg === null) {
        /* istanbul ignore next */
        return;
      }

      // catch when error amqp (untestable)
      /* istanbul ignore next */
      if (msg.properties.replyTo === undefined) {
        throw new AmqpReplytoIsMissingError();
      }
      const extractArgs = this.getExtractArgs(propKey, controller);
      const args = await extractArgs(msg);

      let response: any;
      let sendOptions: SendOptions;
      try {
        response = await toPromise(controller[propKey](...args));
        sendOptions = handlerMetadata.sendOptions || {};
      } catch (err) {
        response = err;
        sendOptions = handlerMetadata.sendOptionsError || {};
      }

      this.sendToQueueAck(msg.properties.replyTo, response, msg, {
        correlationId: msg.properties.correlationId,
        contentEncoding: this.gzipEnabled ? 'gzip' : undefined,
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

    if (params.length === 0) {
      // eslint-disable-next-line no-return-assign
      return (this.extractArgs[k] = async (msg) => [
        await this.parseContent(msg),
      ]);
    }

    const parameters: RabbitParamDecorator[] = params.map(
      (meta) => meta.slice(-1)[0],
    );

    // eslint-disable-next-line no-return-assign
    return (this.extractArgs[k] = async (msg) => {
      const content = await this.parseContent(msg);
      return parameters.map((p) => p.handler(p.args, msg, content));
    });
  }

  private getChannel(): ConfirmChannel {
    // eslint-disable-next-line no-underscore-dangle
    if ((<any>this.channel)._channel === null) {
      throw new AmqpConnectionError();
    }
    // eslint-disable-next-line no-underscore-dangle
    return (<any>this.channel)._channel;
  }
}
