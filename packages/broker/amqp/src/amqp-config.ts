import {
  PluginConfig,
  Bean,
  Value,
  inject,
  VALUE_EXTRACTOR,
  ValueExtractor,
  InjectContainer,
  Init,
  Container,
  INJECT_CONTAINER_KEY,
} from '@gabliam/core';
import { ConnectionConfig } from './interfaces';
import { configurationValidator } from './schema';
import { AmqpConnection } from './amqp-connection';
import { AmqpConnectionManager } from './amqp-manager';

@InjectContainer()
@PluginConfig()
export class AmqpConfig {
  @Value('application.amqp', configurationValidator)
  private connectionConfig!: ConnectionConfig | ConnectionConfig[];

  constructor(@inject(VALUE_EXTRACTOR) public valueExtractor: ValueExtractor) {}

  // when all bean are created, we create bean Connection for back compat
  @Init()
  async init() {
    const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
    const connectionManager = container.get(AmqpConnectionManager);

    // for back compat
    container
      .bind(AmqpConnection)
      .toConstantValue(connectionManager.getDefaultConnection());
  }

  @Bean(AmqpConnectionManager)
  async createManager() {
    if (!this.connectionConfig) {
      throw new Error(`AmqpPluginConfig AmqpConfig is mandatory`);
    }
    let connectionConfig: ConnectionConfig[];
    if (Array.isArray(this.connectionConfig)) {
      connectionConfig = this.connectionConfig;
    } else {
      connectionConfig = [this.connectionConfig];
    }

    return new AmqpConnectionManager(connectionConfig, this.valueExtractor);
  }
}
