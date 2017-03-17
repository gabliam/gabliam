import { PluginConfig, Value, optional, Bean, inject } from '@gabliam/core';
import { MongooseConnectionOptionsBeanId, LIST_DOCUMENT } from './constants';
import { MongooseConnection } from './mongooseConnection';
import * as mongoose from 'mongoose';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:mongoose');

@PluginConfig()
export class PluginMongooseConfig {

    @Value('application.mongoose.uri')
    uri: string;

    @Value('application.mongoose.host')
    host: string;

    @Value('application.mongoose.database_name')
    database_name: string;

    @Value('application.mongoose.port')
    port: string;

    @Value('application.mongoose.options')
    connectionOptions: mongoose.ConnectionOptions;

    listDocument: any[];

    constructor(
        @inject(MongooseConnectionOptionsBeanId) @optional() connectionOptions: mongoose.ConnectionOptions,
        @inject(LIST_DOCUMENT) listDocument
    ) {
        debug('constructor PluginMongooseConfig', connectionOptions);
        this.connectionOptions = connectionOptions;
        this.listDocument = listDocument;
    }

    @Bean('MongooseConnection')
    create() {
        let mongooseConnection = new MongooseConnection(this.uri, this.connectionOptions, this.listDocument);
        return mongooseConnection;
    }
}
