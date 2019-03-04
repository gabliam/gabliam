import { ConnectionConfig, QueueDictionnary } from './interfaces';
import { AmqpConnection } from './amqp-connection';
import { Queue } from './queue';
import { ValueExtractor } from '@gabliam/core';
import {
  AmqpDuplicateConnectionError,
  AmqpConnectionNotFoundError,
} from './errors';

export class AmqpConnectionManager {
  private connections: AmqpConnection[] = [];

  constructor(
    connectionConfigs: ConnectionConfig[],
    valueExtractor: ValueExtractor
  ) {
    for (const [
      index,
      { name, url, queues, undefinedValue, gzipEnabled },
    ] of connectionConfigs.entries()) {
      if (this.connections.find(c => c.name === name) !== undefined) {
        throw new AmqpDuplicateConnectionError(name);
      }

      this.connections.push(
        new AmqpConnection(
          index,
          name,
          url,
          undefinedValue,
          this.createQueue(queues),
          valueExtractor,
          gzipEnabled
        )
      );
    }
  }

  async start() {
    await Promise.all(this.connections.map(c => c.start()));
  }

  async stop() {
    await Promise.all(this.connections.map(c => c.stop()));
  }

  getConnection(name: string) {
    const connection = this.connections.find(c => c.name === name);
    if (!connection) {
      throw new AmqpConnectionNotFoundError(name);
    }
    return connection;
  }

  getDefaultConnection() {
    const connection = this.connections.find(c => c.name === 'default');
    if (connection === undefined) {
      return this.connections[0];
    } else {
      return connection;
    }
  }

  private createQueue(queueConfig: QueueDictionnary = {}) {
    return Object.keys(queueConfig).map<Queue>((k: string) => {
      const q = queueConfig[k];
      return new Queue(q.queueName, q.options);
    });
  }
}
