import { PluginConfig, Value, optional, Bean, inject } from '@gabliam/core';
import { ConnectionOptions, Connection, createConnection } from './typeorm';
import { ConnectionOptionsBeanId, ENTITIES_PATH } from './constant';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:Typeorm');

@PluginConfig()
export class PluginTypeormConfig {
  @Value('application.typeorm.connectionOptions')
  connectionOptions: ConnectionOptions;

  entitiesPath: string[];

  constructor(
    @inject(ConnectionOptionsBeanId)
    @optional()
    connectionOptions: ConnectionOptions,
    @inject(ENTITIES_PATH) entitiesPath: string[]
  ) {
    debug('constructor PluginTypeormConfig', connectionOptions);
    this.connectionOptions = connectionOptions;
    this.entitiesPath = entitiesPath;
  }

  @Bean(Connection)
  create() {
    debug('connectionOptions', this.connectionOptions);
    if (!this.connectionOptions) {
      throw new Error(`PluginTypeormConfig connectionOptions is mandatory`);
    }
    const connectionOptions = this.connectionOptions;
    const entities: any = connectionOptions.entities || [];
    entities.push(...this.entitiesPath);

    return createConnection({
      ...connectionOptions,
      entities
    });
  }
}
