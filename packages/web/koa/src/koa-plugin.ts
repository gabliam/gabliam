import {
  Container,
  GabliamPlugin,
  Plugin,
  Registry,
  Scan,
  toPromise,
} from '@gabliam/core';
import {
  APP,
  cleanPath,
  ExecutionContext,
  extractParameters,
  Interceptor,
  InterceptorInfo,
  ResponseEntity,
  RestMetadata,
  SERVER,
  WebConfiguration,
  WebPluginBase,
  WebPluginConfig,
  WEB_PLUGIN_CONFIG,
  getContext,
} from '@gabliam/web-core';
import * as d from 'debug';
import * as http from 'http';
import { CUSTOM_ROUTER_CREATOR } from './constants';
import { koa, koaRouter } from './koa';
import { RouterCreator, KoaMethods } from './interfaces';
import {
  addContextMiddleware,
  addMiddlewares,
  valideErrorMiddleware,
} from './middleware';
import { isKoaInterceptor } from './koa-interceptor';
import {
  validatorInterceptorToMiddleware,
  convertKoaInterceptorToMiddleware,
} from './utils';

const debug = d('Gabliam:Plugin:ExpressPlugin');

@Plugin('KoaPlugin')
@Scan()
export class KoaPlugin extends WebPluginBase implements GabliamPlugin {
  bindApp(
    container: Container,
    registry: Registry,
    webConfiguration: WebConfiguration
  ): void {
    container.bind(APP).toConstantValue(new koa());

    webConfiguration.addwebConfig({
      instance: valideErrorMiddleware,
      order: -3,
    });

    webConfiguration.addwebConfig({
      instance: addMiddlewares,
      order: -2,
    });

    webConfiguration.addwebConfig({
      instance: addContextMiddleware,
      order: -1,
    });
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
    const restConfig = container.get<WebPluginConfig>(WEB_PLUGIN_CONFIG);
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

  async buildControllers(
    restMetadata: RestMetadata<KoaMethods>,
    container: Container
  ) {
    // get the router creator
    let routerCreator: RouterCreator = (prefix?: string) =>
      new koaRouter({
        prefix,
      });
    try {
      routerCreator = container.get<RouterCreator>(CUSTOM_ROUTER_CREATOR);
    } catch (e) {}

    for (const [
      controllerId,
      { methods, controllerPath },
    ] of restMetadata.controllerInfo) {
      const controller = container.get<object>(controllerId);
      let routerPath: string | undefined = cleanPath(
        `${restMetadata.rootPath}${controllerPath}`
      );

      if (routerPath === '/') {
        routerPath = undefined;
      }

      debug(`New route : "${routerPath}"`);
      const router = routerCreator(routerPath);

      for (const methodInfo of methods) {
        const execCtx = new ExecutionContext(controller, methodInfo);

        const allInterceptors = [
          ...methodInfo.controllerInterceptors,
          ...methodInfo.methodInterceptors,
        ];

        // get koa interceptor
        const koaInterceptors = allInterceptors.filter(({ instance }) =>
          isKoaInterceptor(instance)
        );

        const interceptors = allInterceptors.filter(
          ({ instance }) => !isKoaInterceptor(instance)
        );

        const koaMiddlewares = await convertKoaInterceptorToMiddleware(
          koaInterceptors
        );

        koaMiddlewares.unshift(
          await validatorInterceptorToMiddleware(
            execCtx,
            methodInfo.validatorInterceptor
          )
        );

        let methodMetadataPath = methodInfo.methodPath;
        if (methodMetadataPath[0] !== '/') {
          methodMetadataPath = '/' + methodMetadataPath;
        }

        const addJsonHandler = async (
          context: koaRouter.IRouterContext,
          next: () => Promise<any>
        ) => {
          context.state.jsonHandler = methodInfo.json;
          await next();
        };

        // create handler
        const handler = this.handlerFactory(execCtx, interceptors);

        // register handler in router
        router[methodInfo.method](
          methodMetadataPath,
          addJsonHandler,
          ...koaMiddlewares,
          handler
        );
      }
      const app = container.get<koa>(APP);

      app.use(router.routes()).use(router.allowedMethods());
    }
  }

  private handlerFactory(
    execCtx: ExecutionContext,
    interceptors: InterceptorInfo<Interceptor>[]
  ): koaRouter.IMiddleware {
    return async (
      context: koaRouter.IRouterContext,
      next: () => Promise<any>
    ) => {
      const req = context.req;
      const ctx = getContext(req);
      const methodInfo = execCtx.getMethodInfo();
      const controller = execCtx.getClass();

      // extract all args
      const args = extractParameters(
        controller,
        methodInfo.methodName,
        execCtx,
        ctx,
        next,
        methodInfo.paramList
      );

      const sendJsonValue = (value: any = '') => {
        let val: any;
        try {
          val = JSON.stringify(value);
        } catch {
          /* istanbul ignore next */
          val = value;
        }
        context.type = 'application/json';
        context.body = val;
      };

      // response handler if the result is a ResponseEntity
      function responseEntityHandler(value: ResponseEntity) {
        if (value.hasHeader()) {
          Object.keys(value.headers).forEach(k =>
            context.set(k, '' + value.headers[k])
          );
        }
        context.status = value.status;
        sendJsonValue(value.body);
      }

      let result: any;
      if (Array.isArray(interceptors) && interceptors.length) {
        const r = toPromise(controller[methodInfo.methodName](...args));
        for (const { instance, paramList } of interceptors) {
          const interceptorArgs = extractParameters(
            instance,
            'intercept',
            execCtx,
            ctx,
            next,
            paramList,
            r
          );
          await toPromise(instance.intercept(...interceptorArgs));
        }
        result = await r;
      } else {
        result = await toPromise(controller[methodInfo.methodName](...args));
      }

      if (!context.headerSent) {
        if (result !== undefined) {
          if (result instanceof ResponseEntity) {
            responseEntityHandler(result);
          } else if (methodInfo.json) {
            sendJsonValue(result);
          } else {
            context.body = result;
          }
        } else if (ctx.body !== undefined) {
          const { status, message, body, type } = ctx;
          if (type) {
            context.response.type = type;
          }
          if (message) {
            context.response.message = message;
          }

          if (status) {
            context.response.status = status;
          }
          if (methodInfo.json) {
            sendJsonValue(body);
          } else {
            context.body = body;
          }
        }
      }
    };
  }
}
