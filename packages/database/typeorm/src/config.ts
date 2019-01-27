import {
  Bean,
  Container,
  Init,
  inject,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  optional,
  PluginConfig,
  Value,
  ValueExtractor,
  VALUE_EXTRACTOR,
} from '@gabliam/core';
import * as d from 'debug';
import { ConnectionManager } from './connection-manager';
import { ConnectionOptionsBeanId, ENTITIES_TYPEORM } from './constant';
import { TypeormConfigIsMandatoryError } from './errors';
import { Connection, ConnectionOptions } from './typeorm';

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
      throw new TypeormConfigIsMandatoryError();
    }
    let connectionOptions: ConnectionOptions[];
    if (Array.isArray(this.connectionOptions)) {
      connectionOptions = this.connectionOptions;
    } else {
      connectionOptions = [this.connectionOptions];
    }

    const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
    const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

    return new ConnectionManager(
      connectionOptions,
      this.entities,
      valueExtractor
    );
  }
}
