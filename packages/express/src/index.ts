import { interfaces as coreInterfaces, inversifyInterfaces, Scan, Registry } from '@gabliam/core';
import { TYPE, METADATA_KEY, EXPRESS_PLUGIN_CONFIG, APP, SERVER } from './constants';
import { getMiddlewares } from './metadata';
import { cleanPath } from './utils';
import * as interfaces from './interfaces';
import * as express from 'express';
import * as d from 'debug';
import * as http from 'http';

const debug = d('Gabliam:Plugin:ExpressPlugin');

export * from './decorators';
export { interfaces, APP, SERVER };

@Scan(__dirname)
export default class ExpressPlugin implements coreInterfaces.GabliamPlugin {
    errorMiddlewares = [];

    bind(container: inversifyInterfaces.Container, registry: Registry) {
        container.bind(APP).toConstantValue(express());
        registry.get(TYPE.Controller)
            .forEach(({ id, target }) => container.bind<any>(id).to(target).inSingletonScope());
    }

    build(container: inversifyInterfaces.Container, registry: Registry) {
        this.buildControllers(container, registry);
        this.buildExpressErrorConfig(container, registry);
    }

    config(container: inversifyInterfaces.Container, registry: Registry, confInstance: any) {
        let app = container.get<express.Application>(APP);
        if (Reflect.hasMetadata(METADATA_KEY.MiddlewareConfig, confInstance.constructor)) {
            let metadataList: interfaces.ExpressConfigMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.MiddlewareConfig,
                confInstance.constructor
            );
            metadataList.forEach(({ key }) => {
                confInstance[key](app);
            });
        }

        if (Reflect.hasMetadata(METADATA_KEY.MiddlewareErrorConfig, confInstance.constructor)) {
            let metadataList: interfaces.ExpressConfigMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.MiddlewareErrorConfig,
                confInstance.constructor
            );
            metadataList.forEach(({ key }) => {
                this.errorMiddlewares.push(confInstance[key].bind(confInstance[key]));
            });
        }
    }

    private buildExpressErrorConfig(container: inversifyInterfaces.Container, registry: Registry) {
        let app = container.get<express.Application>(APP);
        this.errorMiddlewares.forEach(mid => mid(app));
    }

    private buildControllers(container: inversifyInterfaces.Container, registry: Registry) {
        let restConfig = container.get<interfaces.ExpressPluginConfig>(EXPRESS_PLUGIN_CONFIG);
        debug('registerControllers', TYPE.Controller);
        let controllerIds = registry.get(TYPE.Controller);
        controllerIds.forEach(({ id: controllerId }) => {
            let controller = container.get<interfaces.Controller>(controllerId);

            let controllerMetadata: interfaces.ControllerMetadata = Reflect.getOwnMetadata(
                METADATA_KEY.controller,
                controller.constructor
            );

            let controllerMiddlewares = getMiddlewares(container, controller.constructor);

            let methodMetadatas: interfaces.ControllerMethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                controller.constructor
            );

            if (controllerMetadata && methodMetadatas) {
                let router = express.Router();
                let routerPath = cleanPath(`${restConfig.rootPath}${controllerMetadata.path}`);
                debug(`New route : "${routerPath}"`);
                methodMetadatas.forEach((methodMetadata: interfaces.ControllerMethodMetadata) => {
                    let methodMetadataPath = cleanPath(methodMetadata.path);
                    let methodMiddlewares = getMiddlewares(container, controller.constructor, methodMetadata.key);
                    debug(methodMetadataPath);
                    debug({ methodMiddlewares, controllerMiddlewares });
                    let handler: express.RequestHandler = this.handlerFactory(
                        container,
                        controllerId,
                        methodMetadata.key,
                        controllerMetadata.json
                    );
                    router[methodMetadata.method](
                        methodMetadataPath,
                        ...controllerMiddlewares,
                        ...methodMiddlewares,
                        handler
                    );
                });
                let app = container.get<express.Application>(APP);
                app.use(routerPath, router);
            }
        });
    }

    private handlerFactory(
        container: inversifyInterfaces.Container,
        controllerId: any,
        key: string,
        json: boolean
    ): express.RequestHandler {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let result: any = container.get(controllerId)[key](req, res, next);

            // try to resolve promise
            if (result && result instanceof Promise) {

                result.then((value: any) => {
                    if (value !== undefined && !res.headersSent) {
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

            } else if (result !== undefined && !res.headersSent) {
                if (json) {
                    res.json(result);
                } else {
                    res.send(result);
                }
            }
        };
    }

    async destroy(container: inversifyInterfaces.Container, registry: Registry) {
        await this.stop(container, registry);
    }

    async stop(container: inversifyInterfaces.Container, registry: Registry) {
        try {
            // server can be undefined (if start is not called)
            let server = container.get<http.Server>(SERVER);
            return new Promise<void>((resolve) => {
                server.close(() => resolve());
            });
        } catch (e) {
        }
    }

    async start(container: inversifyInterfaces.Container, registry: Registry) {
        let restConfig = container.get<interfaces.ExpressPluginConfig>(EXPRESS_PLUGIN_CONFIG);
        let app = container.get<express.Application>(APP);
        let port = restConfig.port;
        app.set('port', port);

        const server = http.createServer(app);
        server.listen(port, restConfig.hostname);
        server.on('error', onError);
        server.on('listening', onListening);
        container.bind(SERVER).toConstantValue(server);

        function onError(error: NodeJS.ErrnoException): void {
            // tslint:disable-next-line:curly
            if (error.syscall !== 'listen') throw error;
            let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
            switch (error.code) {
                case 'EACCES':
                    console.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        function onListening(): void {
            let addr = server.address();
            let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
            console.log(`Listening on ${bind}`);
        }
    }
}
