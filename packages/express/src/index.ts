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
  middlewares: interfaces.ExpressConfig[] = [];

  errorMiddlewares: interfaces.ExpressConfig[] = [];

  bind(container: inversifyInterfaces.Container, registry: Registry) {
    container.bind(APP).toConstantValue(express());
    registry.get(TYPE.Controller)
      .forEach(({ id, target }) => container.bind<any>(id).to(target).inSingletonScope());
  }

  build(container: inversifyInterfaces.Container, registry: Registry) {
    this.buildExpressConfig(container, registry);
    this.buildControllers(container, registry);
    this.buildExpressErrorConfig(container, registry);
  }

  config(container: inversifyInterfaces.Container, registry: Registry, confInstance: any) {
    if (Reflect.hasMetadata(METADATA_KEY.MiddlewareConfig, confInstance.constructor)) {
      const metadataList: interfaces.ExpressConfigMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.MiddlewareConfig,
        confInstance.constructor
      );

      metadataList.forEach(({ key, order }) => {
        this.middlewares.push({ order, instance: confInstance[key].bind(confInstance[key]) })
      });
    }

    if (Reflect.hasMetadata(METADATA_KEY.MiddlewareErrorConfig, confInstance.constructor)) {
      const metadataList: interfaces.ExpressConfigMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.MiddlewareErrorConfig,
        confInstance.constructor
      );

      metadataList.forEach(({ key, order }) => {
        this.errorMiddlewares.push({ order, instance: confInstance[key].bind(confInstance[key]) });
      });
    }
  }

  private buildExpressConfig(container: inversifyInterfaces.Container, registry: Registry) {
    const app = container.get<express.Application>(APP);
    this.middlewares
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app));
  }

  private buildExpressErrorConfig(container: inversifyInterfaces.Container, registry: Registry) {
    const app = container.get<express.Application>(APP);
    this.errorMiddlewares
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app));
  }

  private buildControllers(container: inversifyInterfaces.Container, registry: Registry) {
    const restConfig = container.get<interfaces.ExpressPluginConfig>(EXPRESS_PLUGIN_CONFIG);

    debug('registerControllers', TYPE.Controller);
    const controllerIds = registry.get(TYPE.Controller);
    controllerIds.forEach(({ id: controllerId }) => {
      const controller = container.get<object>(controllerId);

      const controllerMetadata: interfaces.ControllerMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controller,
        controller.constructor
      );

      const controllerMiddlewares = getMiddlewares(container, controller.constructor);

      const methodMetadatas: interfaces.ControllerMethodMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.controllerMethod,
        controller.constructor
      );

      if (controllerMetadata && methodMetadatas) {
        const router = express.Router();
        const routerPath = cleanPath(`${restConfig.rootPath}${controllerMetadata.path}`);

        debug(`New route : "${routerPath}"`);

        methodMetadatas.forEach((methodMetadata: interfaces.ControllerMethodMetadata) => {
          const methodMetadataPath = cleanPath(methodMetadata.path);
          const methodMiddlewares = getMiddlewares(container, controller.constructor, methodMetadata.key);
          debug(methodMetadataPath);
          debug({ methodMiddlewares, controllerMiddlewares });
          const handler: express.RequestHandler = this.handlerFactory(
            container,
            controllerId,
            methodMetadata.key,
            controllerMetadata.json
          );
          (router as any)[methodMetadata.method](
            methodMetadataPath,
            ...controllerMiddlewares,
            ...methodMiddlewares,
            handler
          );
        });
        const app = container.get<express.Application>(APP);
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
      const result: any = container.get<any>(controllerId)[key](req, res, next);

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
      const server = container.get<http.Server>(SERVER);
      return new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    } catch (e) {
    }
  }

  async start(container: inversifyInterfaces.Container, registry: Registry) {
    const restConfig = container.get<interfaces.ExpressPluginConfig>(EXPRESS_PLUGIN_CONFIG);
    const app = container.get<express.Application>(APP);
    const port = restConfig.port;
    app.set('port', port);

    const server = http.createServer(app);
    server.listen(port, restConfig.hostname);
    server.on('error', onError);
    server.on('listening', onListening);
    container.bind(SERVER).toConstantValue(server);

    function onError(error: NodeJS.ErrnoException): void {
      // tslint:disable-next-line:curly
      if (error.syscall !== 'listen') throw error;
      const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
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
      const addr = server.address();
      const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`Listening on ${bind}`);
    }
  }
}
