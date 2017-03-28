import { PluginConfig, Value, Bean, inject } from '@gabliam/core';
import { LIST_DOCUMENT } from './constants';
import { MongooseConfiguration } from './interfaces';
import { MongooseConnection } from './mongooseConnection';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:mongoose');

@PluginConfig()
export class PluginMongooseConfig {

    @Value('application.mongoose')
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
