import * as express from 'express';
import * as inversify from 'inversify';
import * as interfaces from './interfaces';
import * as _ from 'lodash';
import { TYPE, METADATA_KEY, DEFAULT_ROUTING_ROOT_PATH, APP_CONFIG, CORE_CONFIG } from './constants';
import { loadModules, loadConfig } from './loader';
import { container } from './container';
import { registry } from './registry';
import * as d from 'debug';

const debug = d('Gabliam:core');
const debugRoute = d('Gabliam:route');

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
    private _routingConfig: interfaces.RoutingConfig;

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
        this._routingConfig = this._options.routingConfig || {
            rootPath: DEFAULT_ROUTING_ROOT_PATH
        };
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

    public addPlugin(fn: interfaces.GabliamPlugin): Gabliam {
        this._plugins.push(fn);
        return this;
    }

    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    public async build(): Promise<express.Application> {
        this._initializeConfig();
        this._initializePlugin();

        loadModules(registry.getPaths());

        this._bind();
        await this._loadConfig();

        // register server-level middleware before anything else
        this._configFn.forEach(fn => fn(this._app));

        this._plugins
            .filter(plugin => typeof plugin.build === 'function')
            .forEach(plugin => plugin.build(this._app, registry, this.container));

        this.registerControllers();

        // register error handlers after controllers
         this._errorConfigFn.forEach(fn => fn(this._app));

        return this._app;
    }

    private _initializePlugin() {
        this._plugins = this._plugins.map(fn => {
            let instance = <interfaces.GabliamPlugin>new (fn as any)(this._options);
            if (typeof instance.addConfig === 'function') {
                this.addConfig(instance.addConfig());
            }

            if (typeof instance.addErrorConfig === 'function') {
                this.addErrorConfig(instance.addErrorConfig());
            }

            return instance;
        });
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

        registry.get(TYPE.Controller)
            .forEach(({id, target}) => this.container.bind<any>(id).to(target).inSingletonScope());

        this._plugins
            .filter(plugin => typeof plugin.bind === 'function')
            .forEach(plugin => plugin.bind(registry, this.container));
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

    private registerControllers() {
        debug('registerControllers');
        let controllerIds = registry.get(TYPE.Controller);

        controllerIds.forEach(({id: controllerId}) => {
            let controller = this.container.get<interfaces.Controller>(controllerId);

            let controllerMetadata: interfaces.ControllerMetadata = Reflect.getOwnMetadata(
                METADATA_KEY.controller,
                controller.constructor
            );

            let methodMetadata: interfaces.ControllerMethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                controller.constructor
            );

            if (controllerMetadata && methodMetadata) {

                methodMetadata.forEach((metadata: interfaces.ControllerMethodMetadata) => {
                    debugRoute(`${controllerMetadata.path}${metadata.path}`);
                    let handler: express.RequestHandler = this.handlerFactory(controllerId, metadata.key, controllerMetadata.json);
                    this._router[metadata.method](
                        `${controllerMetadata.path}${metadata.path}`,
                        ...controllerMetadata.middlewares,
                        ...metadata.middlewares,
                        handler
                    );
                });
            }
        });

        this._app.use(this._routingConfig.rootPath, this._router);
    }

    private handlerFactory(controllerId: any, key: string, json: boolean): express.RequestHandler {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let result: any = this.container.get(controllerId)[key](req, res, next);

            // try to resolve promise
            if (result && result instanceof Promise) {

                result.then((value: any) => {
                    if (value && !res.headersSent) {
                        if (json) {
                            res.json(value);
                        } else {
                            res.send(value);
                        }
                    }
                })
                    .catch((error: any) => {
                        next(error);
                    });

            } else if (result && !res.headersSent) {
                if (json) {
                    res.json(result);
                } else {
                    res.send(result);
                }
            }
        };
    }
}
