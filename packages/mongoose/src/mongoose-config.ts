import { PluginConfig, Value, Bean, inject } from '@gabliam/core';
import { LIST_DOCUMENT } from './constants';
import { configurationValidator } from './configuration-validator';
import { MongooseConfiguration } from './interfaces';
import { MongooseConnection } from './mongoose-connection';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:mongoose');

@PluginConfig()
export class PluginMongooseConfig {

  @Value('application.mongoose', configurationValidator)
  mongooseConfiguration: MongooseConfiguration;

  listDocument: any[];

  constructor(
    @inject(LIST_DOCUMENT) listDocument: any[]
  ) {
    debug('constructor PluginMongooseConfig');
    this.listDocument = listDocument;
  }

  @Bean(MongooseConnection)
  create() {
    debug('Create MongooseConnection', this.mongooseConfiguration);
    return new MongooseConnection(this.mongooseConfiguration, this.listDocument);
  }
}
