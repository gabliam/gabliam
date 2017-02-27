import * as express from 'express';
import * as inversify from 'inversify';
import * as interfaces from './interfaces';
import * as _ from 'lodash';
import { TYPE, METADATA_KEY, APP_CONFIG, CORE_CONFIG } from './constants';
import { loadModules, loadConfig } from './loader';
import { container } from './container';
import { registry } from './registry';
import * as d from 'debug';

const debug = d('Gabliam:core');

/**
 * Wrapper for the express server.
 */
export class Gabliam {
    private _plugins: interfaces.GabliamPlugin[] = [];
    private _options: interfaces.GabliamConfig;
    private _router: express.Router;
    private _app: express.Application = express();
    private _configFn: interfaces.ConfigFunction[] = [];
    private _errorConfigFn: interfaces.ConfigFunction[] = [];

    public container: inversify.interfaces.Container = container;


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

        registry.addPath(this._options.discoverPath);

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
        this._plugins.push(this._initializePlugin(ctor));
        return this;
    }

    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    public async build(): Promise<express.Application> {
        this._initializeConfig();

        loadModules(registry.getPaths());

        this._bind();
        await this._loadConfig();

        // register server-level middleware before anything else
        this._configFn.forEach(fn => fn(this._app));

        this._plugins
            .filter(plugin => typeof plugin.build === 'function')
            .forEach(plugin => plugin.build());

        // register error handlers after controllers
        this._errorConfigFn.forEach(fn => fn(this._app));

        return this._app;
    }

    private _initializePlugin(ctor: interfaces.GabliamPluginConstructor): interfaces.GabliamPlugin {
        let instance = new ctor(this._app, this.container);
        if (typeof instance.addConfig === 'function') {
            this.addConfig(instance.addConfig());
        }

        if (typeof instance.addErrorConfig === 'function') {
            this.addErrorConfig(instance.addErrorConfig());
        }

        return instance;
    }

    private _initializeConfig() {
        let config = loadConfig(this._options.configPath);
        this.container.bind<any>(APP_CONFIG).toConstantValue(config);
    }

    private _bind() {
        registry.get(TYPE.Config)
            .forEach(({id, target}) => this.container.bind<any>(id).to(target).inSingletonScope());

        registry.get(TYPE.Service)
            .forEach(({id, target}) => this.container.bind<any>(id).to(target).inSingletonScope());

        this._plugins
            .filter(plugin => typeof plugin.bind === 'function')
            .forEach(plugin => plugin.bind());
    }

    private async _loadConfig() {
        debug('_loadConfig');
        async function callInstance(instance, key) {
            return Promise.resolve(instance[key]());
        }

        let configsRegistry = registry.get<interfaces.ConfigRegistry>(TYPE.Config);
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
