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
import d from 'debug';
import { ConnectionManager } from './connection-manager';
import { GabliamConnectionOptionsReader } from './connection-options-reader';
import {
  ConnectionOptionsBeanId,
  ENTITIES_TYPEORM,
  MIGRATIONS_TYPEORM,
  SUBSCRIBERS_TYPEORM,
} from './constant';
import { Connection, ConnectionOptions } from './typeorm';

const debug = d('Gabliam:Plugin:Typeorm');

@InjectContainer()
@PluginConfig()
export class PluginTypeormConfig {
  @Value('application.typeorm.connectionOptions')
  connectionOptions: ConnectionOptions | ConnectionOptions[] | undefined;

  entities: {
    entities: Function[];
    migrations: Function[];
    subscribers: Function[];
  };

  migrations: Function[];

  constructor(
    @inject(ConnectionOptionsBeanId)
    @optional()
    connectionOptions: ConnectionOptions | ConnectionOptions[],
    @inject(ENTITIES_TYPEORM) entities: Function[],
    @inject(MIGRATIONS_TYPEORM) migrations: Function[],
    @inject(SUBSCRIBERS_TYPEORM) subscribers: Function[]
  ) {
    debug('constructor PluginTypeormConfig', connectionOptions);
    this.connectionOptions = connectionOptions;
    this.entities = { entities, migrations, subscribers };
  }

  // when all bean are created, we create bean Connection for back compat
  @Init()
  async init() {
    const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
    const connectionManager = container.get(ConnectionManager);

    // for back compat
    container
      .bind(Connection)
      .toDynamicValue(() => connectionManager.getDefaultConnection());
  }

  @Bean(GabliamConnectionOptionsReader)
  createGabliamConnectionOptionsReader() {
    debug('connectionOptions', this.connectionOptions);

    let connectionOptions: ConnectionOptions[] | undefined = undefined;
    if (Array.isArray(this.connectionOptions)) {
      connectionOptions = this.connectionOptions;
    } else if (this.connectionOptions) {
      connectionOptions = [this.connectionOptions];
    }

    const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
    const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

    return new GabliamConnectionOptionsReader(
      connectionOptions,
      this.entities,
      valueExtractor
    );
  }

  @Bean(ConnectionManager)
  createManager() {
    return new ConnectionManager(this.createGabliamConnectionOptionsReader());
  }
}
