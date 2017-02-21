import { PluginConfig, Value, optional, Bean, CORE_CONFIG, inject, interfaces } from '@gabliam/core';
import { ConnectionOptions, Connection, createConnection } from './typeorm';
import {ConnectionOptionsBeanId} from './constant';
import * as d from 'debug';

const debug = d('Gabliam:Plugin:Typeorm');

@PluginConfig()
export class PluginTypeormConfig {

    @Value('application.typeorm.connectionOptions')
    connectionOptions: ConnectionOptions;

    @Value('application.typeorm.entitiesPath')
    entitiesPath: string;

    constructor(
        @inject(ConnectionOptionsBeanId) @optional() connectionOptions: ConnectionOptions,
        @inject(CORE_CONFIG) config: interfaces.GabliamConfig
    ) {
        debug('constructor PluginTypeormConfig', connectionOptions, config);
        this.connectionOptions = connectionOptions;
        this.entitiesPath = `${config.discoverPath}/**/*{.js,.ts}`;
    }

    @Bean(Connection)
    create() {
        debug('connectionOptions', this.connectionOptions);
        if (!this.connectionOptions){
            throw new Error(`PluginTypeormConfig connectionOptions is mandatory`);
        } 
        let connectionOptions = this.connectionOptions;
        let entities: any = connectionOptions.entities || [];
        entities.push(this.entitiesPath);

        return createConnection({
            ...connectionOptions,
            entities
        });
    }
}