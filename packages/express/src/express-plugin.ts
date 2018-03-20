import {
  Scan,
  Registry,
  Plugin,
  Container,
  GabliamPlugin,
  ValueExtractor,
  VALUE_EXTRACTOR
} from '@gabliam/core';
import {
  EXPRESS_PLUGIN_CONFIG,
  APP,
  SERVER,
  CUSTOM_ROUTER_CREATOR
} from './constants';
import {
  TYPE,
  METADATA_KEY,
  PARAMETER_TYPE,
  DEFAULT_PARAM_VALUE,
  getMiddlewares,
  ResponseEntity,
  ConfigMetadata,
  ControllerMetadata,
  ControllerMethodMetadata,
  ControllerParameterMetadata,
  ParameterMetadata,
  cleanPath
} from '@gabliam/rest-decorators';
import { ExpressPluginConfig, RouterCreator } from './interfaces';
import * as d from 'debug';
import * as http from 'http';
import { MiddlewareConfig, ExpressMiddlewareConfig } from './middlewares';
import { express } from './express';

const debug = d('Gabliam:Plugin:ExpressPlugin');

@Plugin('ExpressPlugin')
@Scan()
export class ExpressPlugin implements GabliamPlugin {
  /**
   * binding phase
   *
   * Bind all controller and bind express app
   * @param  {Container} container
   * @param  {Registry} registry
   */
  bind(container: Container, registry: Registry) {
    container.bind(APP).toConstantValue(express());
    registry.get(TYPE.Controller).forEach(({ id, target }) =>
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope()
    );

    container.bind(MiddlewareConfig).toConstantValue(new MiddlewareConfig());
  }

  build(container: Container, registry: Registry) {
    this.buildExpressConfig(container, registry);
    this.buildControllers(container, registry);
    this.buildExpressErrorConfig(container, registry);
  }

  /**
   * Management of @middleware decorator in config class
   *
   * @param  {Container} container
   * @param  {Registry} registry
   * @param  {any} confInstance
   */
  config(container: Container, registry: Registry, confInstance: any) {
    const middlewareConfig = container.get<ExpressMiddlewareConfig>(
      MiddlewareConfig
    );

    // if config class has a @middleware decorator, add in this.middlewares for add it in building phase
    if (
      Reflect.hasMetadata(
        METADATA_KEY.MiddlewareConfig,
        confInstance.constructor
      )
    ) {
      const metadataList: ConfigMetadata[] = Reflect.getOwnMetadata(
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
      const metadataList: ConfigMetadata[] = Reflect.getOwnMetadata(
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

  async destroy(container: Container, registry: Registry) {
    await this.stop(container, registry);
  }

  async stop(container: Container, registry: Registry) {
    try {
      // server can be undefined (if start is not called)
      const server = container.get<http.Server>(SERVER);
      return new Promise<void>(resolve => {
        server.close(() => resolve());
      });
    } catch (e) {}
  }

  async start(container: Container, registry: Registry) {
    const restConfig = container.get<ExpressPluginConfig>(
      EXPRESS_PLUGIN_CONFIG
    );
    const app = container.get<express.Application>(APP);
    const port = restConfig.port;
    app.set('port', port);

    const server = http.createServer(<any>app);
    server.listen(port, restConfig.hostname);
    server.on('error', onError);
    server.on('listening', onListening);
    container.bind(SERVER).toConstantValue(server);

    /* istanbul ignore next */
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

    /* istanbul ignore next */
    function onListening(): void {
      const addr = server.address();
      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`Listening on ${bind}`);
    }
  }

  /**
   * Build express middleware
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private buildExpressConfig(container: Container, registry: Registry) {
    const middlewareConfig = container.get<ExpressMiddlewareConfig>(
      MiddlewareConfig
    );
    const app = container.get<express.Application>(APP);
    middlewareConfig.middlewares
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app));
  }

  /**
   * Build express error middleware
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private buildExpressErrorConfig(container: Container, registry: Registry) {
    const middlewareConfig = container.get<ExpressMiddlewareConfig>(
      MiddlewareConfig
    );

    const app = container.get<express.Application>(APP);
    middlewareConfig.errorMiddlewares
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app));
  }

  /**
   * Build all controllers
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private buildControllers(container: Container, registry: Registry) {
    const restConfig = container.get<ExpressPluginConfig>(
      EXPRESS_PLUGIN_CONFIG
    );

    const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

    // get the router creator
    let routerCreator: RouterCreator = () => express.Router();
    try {
      routerCreator = container.get<RouterCreator>(CUSTOM_ROUTER_CREATOR);
    } catch (e) {}

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
      // if the controller has controllerMetadata and methodMetadatas
      if (controllerMetadata && methodMetadatas) {
        const router = routerCreator();
        const controllerPath = valueExtractor(
          controllerMetadata.path,
          controllerMetadata.path
        );
        const routerPath = cleanPath(`${restConfig.rootPath}${controllerPath}`);

        debug(`New route : "${routerPath}"`);

        methodMetadatas.forEach((methodMetadata: ControllerMethodMetadata) => {
          let paramList: ParameterMetadata[] = [];
          if (parameterMetadata) {
            paramList = parameterMetadata[methodMetadata.key] || [];
          }
          let methodMetadataPath = cleanPath(
            valueExtractor(methodMetadata.path, methodMetadata.path)
          );
          if (methodMetadataPath[0] !== '/') {
            methodMetadataPath = '/' + methodMetadataPath;
          }
          const methodMiddlewares = getMiddlewares(
            container,
            controller.constructor,
            methodMetadata.key
          );
          debug(methodMetadataPath);
          debug({ methodMiddlewares, controllerMiddlewares });
          // create handler
          const handler: express.RequestHandler = this.handlerFactory(
            container,
            controllerId,
            methodMetadata.key,
            controllerMetadata.json,
            paramList
          );

          // register handler in router
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
    container: Container,
    controllerId: any,
    key: string,
    json: boolean,
    parameterMetadata: ParameterMetadata[]
  ): express.RequestHandler {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const controller = container.get<any>(controllerId);
      // extract all args
      const args = this.extractParameters(
        controller,
        key,
        req,
        res,
        next,
        parameterMetadata
      );

      // response handler if the result is a ResponseEntity
      function responseEntityHandler(value: ResponseEntity) {
        if (value.hasHeader()) {
          Object.keys(value.headers).forEach(k =>
            res.setHeader(k, value.headers[k])
          );
        }
        res.status(value.status).json(value.body);
      }

      try {
        const result: any = await Promise.resolve(controller[key](...args));
        if (result !== undefined && !res.headersSent) {
          if (result instanceof ResponseEntity) {
            responseEntityHandler(result);
          } else if (json) {
            res.json(result);
          } else {
            res.send(result);
          }
        }
      } catch (err) {
        next(err);
      }
    };
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

    // create de param getter
    const getParam = this.getFuncParam(target, key);

    for (const item of params) {
      switch (item.type) {
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
        default:
          args[item.index] = res;
          break; // response
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

      // get the param source
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
        return name === DEFAULT_PARAM_VALUE ? param : undefined;
      }
    };
  }
}
