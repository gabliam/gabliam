import {
  PluginConfig,
  Value,
  optional,
  Bean,
  inject,
  InjectContainer,
  Init,
  Container,
  INJECT_CONTAINER_KEY,
} from '@gabliam/core';
import { ConnectionOptions, Connection } from './typeorm';
import { ConnectionOptionsBeanId, ENTITIES_TYPEORM } from './constant';
import * as d from 'debug';
import { ConnectionManager } from './connection-manager';

const debug = d('Gabliam:Plugin:Typeorm');

@InjectContainer()
@PluginConfig()
export class PluginTypeormConfig {
  @Value('application.typeorm.connectionOptions')
  connectionOptions: ConnectionOptions | ConnectionOptions[];

  entities: Function[];

  constructor(
    @inject(ConnectionOptionsBeanId)
    @optional()
    connectionOptions: ConnectionOptions | ConnectionOptions[],
    @inject(ENTITIES_TYPEORM) entities: Function[]
  ) {
    debug('constructor PluginTypeormConfig', connectionOptions);
    this.connectionOptions = connectionOptions;
    this.entities = entities;
  }

  // when all bean are created, we create bean Connection for back compat
  @Init()
  async init() {
    const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
    const connectionManager = container.get(ConnectionManager);
    await connectionManager.open();

    // for back compat
    container
      .bind(Connection)
      .toConstantValue(connectionManager.getDefaultConnection());
  }

  @Bean(ConnectionManager)
  createManager() {
    debug('connectionOptions', this.connectionOptions);
    if (!this.connectionOptions) {
      throw new Error(`PluginTypeormConfig connectionOptions is mandatory`);
    }
    let connectionOptions: ConnectionOptions[];
    if (Array.isArray(this.connectionOptions)) {
      connectionOptions = this.connectionOptions;
    } else {
      connectionOptions = [this.connectionOptions];
    }

    return new ConnectionManager(connectionOptions, this.entities);
  }
}
