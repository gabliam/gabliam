import {
  Scan,
  Registry,
  Plugin,
  Container,
  GabliamPlugin,
  ValueExtractor,
  VALUE_EXTRACTOR,
} from '@gabliam/core';
import {
  KOA_PLUGIN_CONFIG,
  APP,
  SERVER,
  CUSTOM_ROUTER_CREATOR,
} from './constants';
import { KoaPluginConfig, RouterCreator } from './interfaces';
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
  cleanPath,
} from '@gabliam/web-core';
import * as d from 'debug';
import * as http from 'http';
import { MiddlewareConfig, KoaMiddlewareConfig } from './middlewares';
import { koa, koaRouter } from './koa';

const debug = d('Gabliam:Plugin:KoaPlugin');

@Plugin('KoaPlugin')
@Scan()
export class KoaPlugin implements GabliamPlugin {
  /**
   * binding phase
   *
   * Bind all controller and bind koa app
   * @param  {Container} container
   * @param  {Registry} registry
   */
  bind(container: Container, registry: Registry) {
    container.bind(APP).toConstantValue(new koa());
    registry.get(TYPE.Controller).forEach(({ id, target }) =>
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope()
    );

    container.bind(MiddlewareConfig).toConstantValue(new MiddlewareConfig());
  }

  build(container: Container, registry: Registry) {
    this.buildKoaConfig(container, registry);
    this.buildControllers(container, registry);
  }

  /**
   * Management of @middleware decorator in config class
   *
   * @param  {Container} container
   * @param  {Registry} registry
   * @param  {any} confInstance
   */
  config(container: Container, registry: Registry, confInstance: any) {
    const middlewareConfig = container.get<KoaMiddlewareConfig>(
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
          instance: confInstance[key].bind(confInstance),
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
    const restConfig = container.get<KoaPluginConfig>(KOA_PLUGIN_CONFIG);
    const app = container.get<koa>(APP);
    const port = restConfig.port;

    const server = http.createServer(app.callback());
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
   * Build koa middleware
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private buildKoaConfig(container: Container, registry: Registry) {
    const middlewareConfig = container.get<KoaMiddlewareConfig>(
      MiddlewareConfig
    );
    const app = container.get<koa>(APP);
    middlewareConfig.middlewares
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
    const restConfig = container.get<KoaPluginConfig>(KOA_PLUGIN_CONFIG);
    const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

    // get the router creator
    let routerCreator: RouterCreator = (prefix?: string) =>
      new koaRouter({
        prefix,
      });
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
        const controllerPath = valueExtractor(
          controllerMetadata.path,
          controllerMetadata.path
        );

        let routerPath: string | undefined = cleanPath(
          `${restConfig.rootPath}${controllerPath}`
        );

        if (routerPath === '/') {
          routerPath = undefined;
        }

        debug(`New route : "${routerPath}"`);
        const router = routerCreator(routerPath);

        methodMetadatas.forEach((methodMetadata: ControllerMethodMetadata) => {
          let paramList: ParameterMetadata[] = [];
          if (parameterMetadata) {
            paramList = parameterMetadata.get(methodMetadata.key) || [];
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
          const handler: koaRouter.IMiddleware = this.handlerFactory(
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
        const app = container.get<koa>(APP);

        app.use(router.routes()).use(router.allowedMethods());
      }
    });
  }

  private handlerFactory(
    container: Container,
    controllerId: any,
    key: string,
    json: boolean,
    parameterMetadata: ParameterMetadata[]
  ): koaRouter.IMiddleware {
    return async (ctx: koaRouter.IRouterContext, next: () => Promise<any>) => {
      const controller = container.get<any>(controllerId);

      // extract all args
      const args = this.extractParameters(
        controller,
        key,
        ctx,
        next,
        parameterMetadata
      );
      const result: any = await Promise.resolve(controller[key](...args));

      const sendJsonValue = (value: any = '') => {
        let val: any;
        try {
          val = JSON.stringify(value);
        } catch {
          /* istanbul ignore next */
          val = value;
        }
        ctx.type = 'application/json';
        ctx.body = val;
      };

      // response handler if the result is a ResponseEntity
      function responseEntityHandler(value: ResponseEntity) {
        if (value.hasHeader()) {
          Object.keys(value.headers).forEach(k =>
            ctx.set(k, '' + value.headers[k])
          );
        }
        ctx.status = value.status;
        sendJsonValue(value.body);
      }

      // try to resolve promise
      if (result && result instanceof ResponseEntity) {
        responseEntityHandler(result);
      } else if (result !== undefined && !ctx.headerSent) {
        if (json) {
          sendJsonValue(result);
        } else {
          ctx.body = result;
        }
      }
    };
  }

  private extractParameters(
    target: any,
    key: string,
    ctx: koaRouter.IRouterContext,
    next: () => Promise<any>,
    params: ParameterMetadata[]
  ): any[] {
    const args = [];
    if (!params || !params.length) {
      return [ctx, next];
    }

    // create de param getter
    const getParam = this.getFuncParam(target, key);

    for (const item of params) {
      switch (item.type) {
        default:
          args[item.index] = ctx.response;
          break; // response
        case PARAMETER_TYPE.REQUEST:
          args[item.index] = getParam(ctx.request, null, item);
          break;
        case PARAMETER_TYPE.NEXT:
          args[item.index] = next;
          break;
        case PARAMETER_TYPE.PARAMS:
          args[item.index] = getParam(ctx, 'params', item);
          break;
        case PARAMETER_TYPE.QUERY:
          args[item.index] = getParam(ctx.request, 'query', item);
          break;
        case PARAMETER_TYPE.BODY:
          args[item.index] = getParam(ctx.request, 'body', item);
          break;
        case PARAMETER_TYPE.HEADERS:
          args[item.index] = getParam(ctx.request, 'headers', item);
          break;
        case PARAMETER_TYPE.COOKIES:
          args[item.index] = getParam(ctx, 'cookies', item, true);
          break;
      }
    }
    args.push(ctx, next);
    return args;
  }

  private getFuncParam(target: any, key: string) {
    return (
      source: any,
      paramType: string | null,
      itemParam: ParameterMetadata,
      getter = false
    ) => {
      const name = itemParam.parameterName;

      // get the param source
      let param = source;
      if (paramType !== null && source[paramType]) {
        param = source[paramType];
      }

      let res = getter ? param.get(name) : param[name];
      if (res !== undefined) {
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
