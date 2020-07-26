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
  compose,
  ExecutionContext,
  getContext,
  InterceptorInfo,
  REQUEST_LISTENER_CREATOR,
  RestMetadata,
  SERVER,
  WebConfiguration,
  WebConfigurationContructor,
  WebPluginBase,
  WebPluginConfig,
  WEB_PLUGIN_CONFIG,
} from '@gabliam/web-core';
import d from 'debug';
import http from 'http';
import { CUSTOM_ROUTER_CREATOR } from './constants';
import { converterValue, send } from './converter-value';
import { express } from './express';
import { isValidInterceptor } from './express-interceptor';
import { ExpressMethods, RouterCreator } from './interfaces';
import { addContextMiddleware, addMiddlewares } from './middleware';

const debug = d('Gabliam:Plugin:ExpressPlugin');

@Plugin('ExpressPlugin')
@Scan()
export class ExpressPlugin extends WebPluginBase<express.Application>
  implements GabliamPlugin {
  constructor(
    config?: Partial<WebConfigurationContructor<express.Application>>
  ) {
    super(config);
  }

  bindApp(
    container: Container,
    registry: Registry,
    webConfiguration: WebConfiguration
  ): void {
    container.bind(APP).toConstantValue(express());
    container.bind(REQUEST_LISTENER_CREATOR).toConstantValue(() => {
      const app = container.get<express.Application>(APP);
      return app;
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
    const app = container.get<express.Application>(APP);
    app.set('port', restConfig.port);
    await super.start(container, registry);
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

        const interceptors = methodInfo.interceptors.filter(i =>
          isValidInterceptor(i)
        );

        // create handler
        const handler = this.handlerFactory(execCtx, interceptors);

        // register handler in router
        router[methodInfo.method](methodInfo.methodPath, handler);
      }
      app.use(routerPath, router);
    }
  }

  private handlerFactory(
    execCtx: ExecutionContext,
    interceptors: InterceptorInfo[]
  ): express.RequestHandler {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const composeInterceptor = compose(
        interceptors,
        converterValue
      );
      const ctx = getContext(req);
      const methodInfo = execCtx.getMethodInfo();
      const controller = execCtx.getClass();

      let expressNextCall = false;
      const expressNext = () => {
        expressNextCall = true;
        next();
      };

      const callNext = async () => {
        const args = await toPromise(
          methodInfo.extractArgs(ctx, execCtx, expressNext)
        );
        return await toPromise(controller[methodInfo.methodName](...args));
      };

      try {
        await composeInterceptor(ctx, execCtx, callNext);
        if (!expressNextCall) {
          send(ctx, res, methodInfo.json);
        }
      } catch (err) {
        next(err);
      }
    };
  }
}
