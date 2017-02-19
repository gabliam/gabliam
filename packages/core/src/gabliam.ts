import * as express from "express";
import * as inversify from "inversify";
import * as interfaces from "./interfaces";
import { TYPE, METADATA_KEY, DEFAULT_ROUTING_ROOT_PATH } from "./constants";
import { loader } from './loader';
import { container } from './container';
import { registry } from './registry';

/**
 * Wrapper for the express server.
 */
export class Gabliam {
    private _plugins: interfaces.ModuleFunction[] = [];

    private _router: express.Router;
    public container: inversify.interfaces.Container = container;
    private _app: express.Application = express();
    private _configFn: interfaces.ConfigFunction;
    private _errorConfigFn: interfaces.ConfigFunction;
    private _routingConfig: interfaces.RoutingConfig;

    /**
     * Wrapper for the express server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     */
    constructor(
        public discoverPath: string,
        customRouter?: express.Router,
        routingConfig?: interfaces.RoutingConfig
    ) {
        this._router = customRouter || express.Router();
        this._routingConfig = routingConfig || {
            rootPath: DEFAULT_ROUTING_ROOT_PATH
        };
    }

    /**
     * Sets the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    public setConfig(fn: interfaces.ConfigFunction): Gabliam {
        this._configFn = fn;
        return this;
    }

    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    public setErrorConfig(fn: interfaces.ConfigFunction): Gabliam {
        this._errorConfigFn = fn;
        return this;
    }

    public addPlugin(fn: interfaces.ModuleFunction): Gabliam {
        this._plugins.push(fn);
        return this;
    }

    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    public async build(): Promise<express.Application> {
        loader(this.discoverPath);
        this._loadConfig();
        await Promise.all(this._plugins.map(plugin => plugin(this)));
        

        // register server-level middleware before anything else
        if (this._configFn) {
            this._configFn.apply(undefined, [this._app]);
        }

        this.registerControllers();

        // register error handlers after controllers
        if (this._errorConfigFn) {
            this._errorConfigFn.apply(undefined, [this._app]);
        }

        return this._app;
    }

    private _loadConfig() {
        let configIds = registry.get<inversify.interfaces.ServiceIdentifier<any>>(TYPE.Config);
        configIds.forEach(configId => {
            let confInstance = this.container.get<interfaces.Config>(configId);

            let methodMetadata: interfaces.ConfigMethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.Bean,
                confInstance.constructor
            );

            if (methodMetadata) {
                methodMetadata.forEach(metadata => {
                    this.container.bind<any>(metadata.id).toConstantValue(confInstance[metadata.key]());
                });
            }
        });
    }

    private registerControllers() {
        let controllerIds = registry.get<inversify.interfaces.ServiceIdentifier<any>>(TYPE.Controller);

        controllerIds.forEach((controllerId) => {

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
                    console.log(`${controllerMetadata.path}${metadata.path}`);
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
