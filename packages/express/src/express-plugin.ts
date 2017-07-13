import {
  interfaces as coreInterfaces,
  inversifyInterfaces,
  Scan,
  Registry
} from '@gabliam/core';
import {
  TYPE,
  METADATA_KEY,
  EXPRESS_PLUGIN_CONFIG,
  APP,
  SERVER,
  PARAMETER_TYPE
} from './constants';
import { getMiddlewares } from './metadata';
import { cleanPath } from './utils';
import {
  ExpressConfigMetadata,
  ExpressPluginConfig,
  ControllerMetadata,
  ControllerMethodMetadata,
  ParameterMetadata,
  ControllerParameterMetadata
} from './interfaces';
import * as express from 'express';
import * as d from 'debug';
import * as http from 'http';
import { MiddlewareConfig } from './middlewares';

const debug = d('Gabliam:Plugin:ExpressPlugin');

@Scan(__dirname)
export class ExpressPlugin implements coreInterfaces.GabliamPlugin {
  /**
   * binding phase
   *
   * Bind all controller and bind express app
   * @param  {inversifyInterfaces.Container} container
   * @param  {Registry} registry
   */
  bind(container: inversifyInterfaces.Container, registry: Registry) {
    container.bind(APP).toConstantValue(express());
    registry
      .get(TYPE.Controller)
      .forEach(({ id, target }) =>
        container.bind<any>(id).to(target).inSingletonScope()
      );

    container.bind(MiddlewareConfig).toConstantValue(new MiddlewareConfig());
  }

  build(container: inversifyInterfaces.Container, registry: Registry) {
    this.buildExpressConfig(container, registry);
    this.buildControllers(container, registry);
    this.buildExpressErrorConfig(container, registry);
  }

  /**
   * Management of @middleware decorator in config class
   *
   * @param  {inversifyInterfaces.Container} container
   * @param  {Registry} registry
   * @param  {any} confInstance
   */
  config(
    container: inversifyInterfaces.Container,
    registry: Registry,
    confInstance: any
  ) {
    const middlewareConfig = container.get<MiddlewareConfig>(MiddlewareConfig);
    // if config class has a @middleware decorator, add in this.middlewares for add it in building phase
    if (
      Reflect.hasMetadata(
        METADATA_KEY.MiddlewareConfig,
        confInstance.constructor
      )
    ) {
      const metadataList: ExpressConfigMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.MiddlewareConfig,
        confInstance.constructor
      );

      metadataList.forEach(({ key, order }) => {
        middlewareConfig.addMiddleware({
          order,
          instance: confInstance[key].bind(confInstance[key])
        });
      });
    }

    // if config class has a @middleware decorator, add in this.errorMiddlewares for add it in building phase
    if (
      Reflect.hasMetadata(
        METADATA_KEY.MiddlewareErrorConfig,
        confInstance.constructor
      )
    ) {
      const metadataList: ExpressConfigMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.MiddlewareErrorConfig,
        confInstance.constructor
      );

      metadataList.forEach(({ key, order }) => {
        middlewareConfig.addErrorMiddleware({
          order,
          instance: confInstance[key].bind(confInstance[key])
        });
      });
    }
  }

  /**
   * Build express middleware
   *
   * @param  {inversifyInterfaces.Container} container
   * @param  {Registry} registry
   */
  private buildExpressConfig(
    container: inversifyInterfaces.Container,
    registry: Registry
  ) {
    const middlewareConfig = container.get<MiddlewareConfig>(MiddlewareConfig);
    const app = container.get<express.Application>(APP);
    middlewareConfig.middlewares
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app));
  }

  /**
   * Build express error middleware
   *
   * @param  {inversifyInterfaces.Container} container
   * @param  {Registry} registry
   */
  private buildExpressErrorConfig(
    container: inversifyInterfaces.Container,
    registry: Registry
  ) {
    const middlewareConfig = container.get<MiddlewareConfig>(MiddlewareConfig);
    const app = container.get<express.Application>(APP);
    middlewareConfig.errorMiddlewares
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app));
  }

  private buildControllers(
    container: inversifyInterfaces.Container,
    registry: Registry
  ) {
    const restConfig = container.get<ExpressPluginConfig>(
      EXPRESS_PLUGIN_CONFIG
    );

    debug('registerControllers', TYPE.Controller);
    const controllerIds = registry.get(TYPE.Controller);
    controllerIds.forEach(({ id: controllerId }) => {
      const controller = container.get<object>(controllerId);

      const controllerMetadata: ControllerMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controller,
        controller.constructor
      );

      const controllerMiddlewares = getMiddlewares(
        container,
        controller.constructor
      );

      const methodMetadatas: ControllerMethodMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.controllerMethod,
        controller.constructor
      );

      const parameterMetadata: ControllerParameterMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controllerParameter,
        controller.constructor
      );

      if (controllerMetadata && methodMetadatas) {
        const router = express.Router();
        const routerPath = cleanPath(
          `${restConfig.rootPath}${controllerMetadata.path}`
        );

        debug(`New route : "${routerPath}"`);

        methodMetadatas.forEach((methodMetadata: ControllerMethodMetadata) => {
          let paramList: ParameterMetadata[] = [];
          if (parameterMetadata) {
            paramList = parameterMetadata[methodMetadata.key] || [];
          }
          const methodMetadataPath = cleanPath(methodMetadata.path);
          const methodMiddlewares = getMiddlewares(
            container,
            controller.constructor,
            methodMetadata.key
          );
          debug(methodMetadataPath);
          debug({ methodMiddlewares, controllerMiddlewares });
          const handler: express.RequestHandler = this.handlerFactory(
            container,
            controllerId,
            methodMetadata.key,
            controllerMetadata.json,
            paramList
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
    json: boolean,
    parameterMetadata: ParameterMetadata[]
  ): express.RequestHandler {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const controller = container.get<any>(controllerId);
      const args = this.extractParameters(
        controller,
        key,
        req,
        res,
        next,
        parameterMetadata
      );
      const result: any = controller[key](...args);

      // try to resolve promise
      if (result && result instanceof Promise) {
        result
          .then((value: any) => {
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
      return new Promise<void>(resolve => {
        server.close(() => resolve());
      });
    } catch (e) {}
  }

  async start(container: inversifyInterfaces.Container, registry: Registry) {
    const restConfig = container.get<ExpressPluginConfig>(
      EXPRESS_PLUGIN_CONFIG
    );
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
      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
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
      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`Listening on ${bind}`);
    }
  }

  private extractParameters(
    target: any,
    key: string,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    params: ParameterMetadata[]
  ): any[] {
    const args = [];
    if (!params || !params.length) {
      return [req, res, next];
    }
    const getParam = this.getFuncParam(target, key);

    for (const item of params) {
      switch (item.type) {
        default:
          args[item.index] = res;
          break; // response
        case PARAMETER_TYPE.REQUEST:
          args[item.index] = getParam(req, null, item);
          break;
        case PARAMETER_TYPE.NEXT:
          args[item.index] = next;
          break;
        case PARAMETER_TYPE.PARAMS:
          args[item.index] = getParam(req, 'params', item);
          break;
        case PARAMETER_TYPE.QUERY:
          args[item.index] = getParam(req, 'query', item);
          break;
        case PARAMETER_TYPE.BODY:
          args[item.index] = getParam(req, 'body', item);
          break;
        case PARAMETER_TYPE.HEADERS:
          args[item.index] = getParam(req, 'headers', item);
          break;
        case PARAMETER_TYPE.COOKIES:
          args[item.index] = getParam(req, 'cookies', item);
          break;
      }
    }
    args.push(req, res, next);
    return args;
  }

  private getFuncParam(target: any, key: string) {
    return (
      source: any,
      paramType: string | null,
      itemParam: ParameterMetadata
    ) => {
      const name = itemParam.parameterName;

      let param = source;
      if (paramType !== null && source[paramType]) {
        param = source[paramType];
      }

      let res = param[name];
      if (res) {
        /**
         * For query, all value sare considered to string value.
         * If the query waits for a Number, we try to convert the value
         */
        if (paramType === 'query' || paramType === 'params') {
          const type: Function[] = Reflect.getMetadata(
            'design:paramtypes',
            target,
            key
          );
          if (Array.isArray(type) && type[itemParam.index]) {
            try {
              if (type[itemParam.index].name === 'Number') {
                // parseFloat for compatibility with integer and float
                res = Number.parseFloat(res);
              }
            } catch (e) {}
          }
        }
        return res;
      } else {
        return paramType === 'query' ? undefined : param;
      }
    };
  }
}
