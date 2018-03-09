import {
  PluginConfig,
  Value,
  Bean,
  inject,
  Init,
  InjectContainer,
  Container,
  INJECT_CONTAINER_KEY
} from '@gabliam/core';
import { LIST_DOCUMENT } from './constants';
import { configurationValidator } from './configuration-validator';
import { MongooseConfiguration } from './interfaces';
import { MongooseConnection } from './mongoose-connection';
import * as d from 'debug';
import { MongooseConnectionManager } from './connection-manager';

const debug = d('Gabliam:Plugin:mongoose');

@InjectContainer()
@PluginConfig()
export class PluginMongooseConfig {
  @Value('application.mongoose', configurationValidator)
  mongooseConfiguration!: MongooseConfiguration | MongooseConfiguration[];

  listDocument: Function[];

  constructor(@inject(LIST_DOCUMENT) listDocument: Function[]) {
    debug('constructor PluginMongooseConfig');
    this.listDocument = listDocument;
  }

  // when all bean are created, we create bean Connection for back compat
  @Init()
  async init() {
    const container: Container = (<any>this)[INJECT_CONTAINER_KEY];
    const connectionManager = container.get(MongooseConnectionManager);
    await connectionManager.open();

    // for back compat
    container
      .bind(MongooseConnection)
      .toConstantValue(connectionManager.getDefaultConnection());
  }

  @Bean(MongooseConnectionManager)
  createManager() {
    debug('mongooseConfiguration', this.mongooseConfiguration);
    if (!this.mongooseConfiguration) {
      throw new Error(
        `PluginMongooseConfig mongooseConfiguration is mandatory`
      );
    }
    let mongooseConfiguration: MongooseConfiguration[];
    if (Array.isArray(this.mongooseConfiguration)) {
      mongooseConfiguration = this.mongooseConfiguration;
    } else {
      mongooseConfiguration = [this.mongooseConfiguration];
    }
    const listDocument = Array.isArray(this.listDocument)
      ? this.listDocument
      : [];
    return new MongooseConnectionManager(mongooseConfiguration, listDocument);
  }
}
