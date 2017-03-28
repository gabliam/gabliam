import { PluginConfig, Value, Bean, inject } from '@gabliam/core';
import { LIST_DOCUMENT } from './constants';
import { mongooseConfigurationValidator } from './mongooseConfigurationValidator';
import { MongooseConfiguration } from './interfaces';
import { MongooseConnection } from './mongooseConnection';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:mongoose');

@PluginConfig()
export class PluginMongooseConfig {

    @Value('application.mongoose', mongooseConfigurationValidator)
    mongooseConfiguration: MongooseConfiguration;

    listDocument: any[];

    constructor(
        @inject(LIST_DOCUMENT) listDocument
    ) {
        debug('constructor PluginMongooseConfig');
        this.listDocument = listDocument;
    }

    @Bean('MongooseConnection')
    create() {
        debug('Create MongooseConnection', this.mongooseConfiguration);
        let mongooseConnection = new MongooseConnection(this.mongooseConfiguration, this.listDocument);
        return mongooseConnection;
    }
}
