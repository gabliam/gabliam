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
  getContext,
  Interceptor,
  InterceptorInfo,
  ResponseEntity,
  RestMetadata,
  SERVER,
  WebConfiguration,
  WebPluginBase,
  WebPluginConfig,
  WEB_PLUGIN_CONFIG,
} from '@gabliam/web-core';
import * as d from 'debug';
import * as http from 'http';
import { CUSTOM_ROUTER_CREATOR } from './constants';
import { express } from './express';
import { isExpressInterceptor } from './express-interceptor';
import { ExpressMethods, RouterCreator } from './interfaces';
import {
  addContextMiddleware,
  addMiddlewares,
  valideErrorMiddleware,
} from './middleware';
import {
  convertExpressInterceptorToMiddleware,
  validatorInterceptorToMiddleware,
} from './utils';

const debug = d('Gabliam:Plugin:ExpressPlugin');

@Plugin('ExpressPlugin')
@Scan()
export class ExpressPlugin extends WebPluginBase implements GabliamPlugin {
  bindApp(
    container: Container,
    registry: Registry,
    webConfiguration: WebConfiguration
  ): void {
    container.bind(APP).toConstantValue(express());
    webConfiguration.addwebConfig({
      instance: addMiddlewares,
      order: -2,
    });

    webConfiguration.addwebConfig({
      instance: addContextMiddleware,
      order: -1,
    });
    webConfiguration.addWebConfigAfterCtrl({
      instance: valideErrorMiddleware,
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

  async buildControllers(
    restMetadata: RestMetadata<ExpressMethods>,
    container: Container
  ) {
    const app = container.get<express.Application>(APP);

    // get the router creator
    let routerCreator: RouterCreator = () => express.Router();
    try {
      routerCreator = container.get<RouterCreator>(CUSTOM_ROUTER_CREATOR);
    } catch (e) {}

    for (const [
      controllerId,
      { methods, controllerPath },
    ] of restMetadata.controllerInfo) {
      const controller = container.get<object>(controllerId);
      const router = routerCreator();
      const routerPath = cleanPath(`${restMetadata.rootPath}${controllerPath}`);

      debug(`New route : "${routerPath}"`);

      for (const methodInfo of methods) {
        const execCtx = new ExecutionContext(controller, methodInfo);

        const allInterceptors = [
          ...methodInfo.controllerInterceptors,
          ...methodInfo.methodInterceptors,
        ];
        // const requestHandlers: express.RequestHandler[] = [];
        // const errorRequestHandler: express.ErrorRequestHandler[] = [];

        const expressInterceptors = allInterceptors.filter(({ instance }) =>
          isExpressInterceptor(instance)
        );

        const interceptors = allInterceptors.filter(
          ({ instance }) => !isExpressInterceptor(instance)
        );

        const {
          requestHandlers,
          errorRequestHandler,
        } = await convertExpressInterceptorToMiddleware(expressInterceptors);

        requestHandlers.unshift(
          await validatorInterceptorToMiddleware(
            execCtx,
            methodInfo.validatorInterceptor
          )
        );

        // create handler
        const handler = this.handlerFactory(execCtx, interceptors);

        const addJsonHandler = (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          (req as any).jsonHandler = methodInfo.json;
          next();
        };

        // register handler in router
        router[methodInfo.method](
          methodInfo.methodPath,
          addJsonHandler,
          ...requestHandlers,
          handler,
          ...errorRequestHandler
        );
      }
      app.use(routerPath, router);
    }
  }

  private handlerFactory(
    execCtx: ExecutionContext,
    interceptors: InterceptorInfo<Interceptor>[]
  ): express.RequestHandler {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
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
        let result: any;
        if (Array.isArray(interceptors)) {
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

        if (!res.headersSent) {
          if (result !== undefined) {
            if (result instanceof ResponseEntity) {
              responseEntityHandler(result);
            } else if (methodInfo.json) {
              res.json(result);
            } else {
              if (typeof result === 'string' || typeof result === 'object') {
                res.send(result);
              } else {
                res.send(result !== undefined ? '' + result : undefined);
              }
            }
          } else if (ctx.body !== undefined) {
            const { status, message, body, type } = ctx;
            if (type) {
              res.type(type);
            }
            if (message) {
              res.statusMessage = message;
            }

            if (status) {
              res.status(status);
            }
            if (methodInfo.json) {
              res.json(body);
            } else {
              res.send(body);
            }
          }
        }
      } catch (err) {
        next(err);
      }
    };
  }
}
