import {
  PluginConfig,
  Bean,
  Value,
  inject,
  VALUE_EXTRACTOR,
  interfaces
} from '@gabliam/core';
import { QueueConfiguration } from './interfaces';
import { schemaPlugin } from './schema';
import { Queue } from './queue';
import { AmqpConnection } from './amqp-connection';
import * as Joi from 'joi';

@PluginConfig()
export class AmqpConfig {
  @Value('application.amqp.queues', schemaPlugin)
  private queueConfig: { [k: string]: QueueConfiguration };

  @Value('application.amqp.url', Joi.string().required())
  private url: string;

  constructor(
    @inject(VALUE_EXTRACTOR) public valueExtractor: interfaces.ValueExtractor
  ) {}

  createQueue() {
    return Object.keys(this.queueConfig).map<Queue>((k: string) => {
      const q = this.queueConfig[k];
      return new Queue(q.queueName, q.options);
    });
  }

  @Bean(AmqpConnection)
  async createConnection() {
    const connection = new AmqpConnection(
      this.url,
      this.createQueue(),
      this.valueExtractor
    );
    return connection;
  }
}
