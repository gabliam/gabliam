import * as express from 'express';
import * as inversify from 'inversify';
import * as interfaces from './interfaces';
import * as _ from 'lodash';
import { TYPE, METADATA_KEY, APP_CONFIG, CORE_CONFIG } from './constants';
import { Loader } from './loader';
import { createContainer } from './container';
import { Registry } from './registry';
import * as d from 'debug';

const debug = d('Gabliam:core');

/**
 * Wrapper for the express server.
 */
export class Gabliam {
    private _loader: Loader = new Loader();

    private _plugins: interfaces.GabliamPlugin[] = [];
    private _options: interfaces.GabliamConfig;
    private _router: express.Router;
    private _app: express.Application = express();
    private _configFn: interfaces.ConfigFunction[] = [];
    private _errorConfigFn: interfaces.ConfigFunction[] = [];

    public container: inversify.interfaces.Container = createContainer();

    public config: any;

    public registry: Registry;


    /**
     * Wrapper for the express server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     */
    constructor(options: interfaces.GabliamConfig | string) {
        if (typeof options === 'string') {
            this._options = {
                discoverPath: options
            };
        } else {
            this._options = options;
        }

        if (!this._options.configPath) {
            this._options.configPath = this._options.discoverPath;
        }

        this.container.bind<interfaces.GabliamConfig>(CORE_CONFIG).toConstantValue(this._options);
        this._router = this._options.customRouter || express.Router();
    }

    /**
     * Add the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to Gabliam.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    public addConfig(fn: interfaces.ConfigFunction): Gabliam {
        this._configFn.push(fn);
        return this;
    }

    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to Gabliam.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    public addErrorConfig(fn: interfaces.ConfigFunction): Gabliam {
        this._errorConfigFn.push(fn);
        return this;
    }

    public addPlugin(ctor: interfaces.GabliamPluginConstructor): Gabliam {
        this._plugins.push(new ctor());
        return this;
    }

    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    public async build(): Promise<express.Application> {
        this._initializeConfig();

        this.registry = this._loader.loadModules(this._options.discoverPath, this._plugins);

        this._bind();
        await this._loadConfig();

        this._plugins
            .filter(plugin => typeof plugin.addConfig === 'function')
            .forEach(plugin => this.addConfig(plugin.addConfig(this._app, this.container, this.registry)));

        // register server-level middleware before anything else
        this._configFn.forEach(fn => fn(this._app));

        this._plugins
            .filter(plugin => typeof plugin.build === 'function')
            .forEach(plugin => plugin.build(this._app, this.container, this.registry));

        this._plugins
            .filter(plugin => typeof plugin.addErrorConfig === 'function')
            .forEach(plugin => this.addConfig(plugin.addErrorConfig(this._app, this.container, this.registry)));

        // register error handlers after controllers
        this._errorConfigFn.forEach(fn => fn(this._app));

        return this._app;
    }

    private _initializeConfig() {
        let config = this.config = this._loader.loadConfig(this._options.configPath);
        this.container.bind<any>(APP_CONFIG).toConstantValue(config);
    }

    private _bind() {
         debug('_bind');
        this.registry.get(TYPE.Config)
            .forEach(({id, target}) => this.container.bind<any>(id).to(target).inSingletonScope());

        this.registry.get(TYPE.Service)
            .forEach(({id, target}) => this.container.bind<any>(id).to(target).inSingletonScope());

        this._plugins
            .filter(plugin => typeof plugin.bind === 'function')
            .forEach(plugin => plugin.bind(this._app, this.container, this.registry));
    }

    private async _loadConfig() {
        debug('_loadConfig');
        async function callInstance(instance, key) {
            return Promise.resolve(instance[key]());
        }

        let configsRegistry = this.registry.get<interfaces.ConfigRegistry>(TYPE.Config);
        debug('configsRegistry', configsRegistry);
        if (configsRegistry) {
            configsRegistry = _.sortBy(configsRegistry, 'order');

            for (let {id: configId} of configsRegistry) {
                let confInstance = this.container.get<interfaces.Config>(configId);

                let beanMetadata: interfaces.BeanMetadata[] = Reflect.getOwnMetadata(
                    METADATA_KEY.bean,
                    confInstance.constructor
                );

                if (beanMetadata) {
                    // No promise.all and await because order of beans are important
                    for (let metadata of beanMetadata) {
                        this.container
                            .bind<any>(metadata.id)
                            .toConstantValue(await callInstance(confInstance, metadata.key));
                    }
                }
            }
        }
        debug('_loadConfig end');
    }
}
