import {
  Bean,
  Container,
  Init,
  inject,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  PluginConfig,
  Value,
} from '@gabliam/core';
import d from 'debug';
import { configurationValidator } from './configuration-validator';
import { MongooseConnectionManager } from './connection-manager';
import { LIST_DOCUMENT } from './constants';
import { MongoConfigIsMandatoryError } from './errors';
import { MongooseConfiguration } from './interfaces';
import { MongooseConnection } from './mongoose-connection';

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
      throw new MongoConfigIsMandatoryError();
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
