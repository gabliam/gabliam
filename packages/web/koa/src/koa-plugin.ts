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
  WebPluginBase,
  WebConfigurationContructor,
} from '@gabliam/web-core';
import d from 'debug';
import http from 'http';
import { CUSTOM_ROUTER_CREATOR } from './constants';
import { converterValue } from './converter-value';
import { KoaMethods, RouterCreator } from './interfaces';
import { koa, koaRouter } from './koa';
import { isValidInterceptor } from './koa-interceptor';
import { addContextMiddleware, addMiddlewares } from './middleware';

const debug = d('Gabliam:Plugin:ExpressPlugin');

@Plugin('KoaPlugin')
@Scan()
export class KoaPlugin extends WebPluginBase<koa> implements GabliamPlugin {
  constructor(config?: Partial<WebConfigurationContructor<koa>>) {
    super(config);
  }

  bindApp(
    container: Container,
    registry: Registry,
    webConfiguration: WebConfiguration,
  ): void {
    container.bind(APP).toConstantValue(new koa());
    container.bind(REQUEST_LISTENER_CREATOR).toConstantValue(() => {
      const app = container.get<koa>(APP);
      app.silent = true;
      return app.callback();
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
      return new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    } catch (e) {}
  }

  async buildControllers(
    restMetadata: RestMetadata<KoaMethods>,
    container: Container,
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
        `${restMetadata.rootPath}${controllerPath}`,
      );

      if (routerPath === '/') {
        routerPath = undefined;
      }

      debug(`New route : "${routerPath}"`);
      const router = routerCreator(routerPath);

      for (const methodInfo of methods) {
        const execCtx = new ExecutionContext(controller, methodInfo);

        let methodMetadataPath = methodInfo.methodPath;
        if (methodMetadataPath[0] !== '/') {
          methodMetadataPath = '/' + methodMetadataPath;
        }

        const addJsonHandler = async (
          context: koaRouter.IRouterContext,
          next: () => Promise<any>,
        ) => {
          context.state.jsonHandler = methodInfo.json;
          await next();
        };

        const interceptors = methodInfo.interceptors.filter((i) =>
          isValidInterceptor(i.instance),
        );

        // create handler
        const handler = this.handlerFactory(execCtx, interceptors);

        // register handler in router
        router[methodInfo.method](methodMetadataPath, addJsonHandler, handler);
      }
      const app = container.get<koa>(APP);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore koa-router bad definition
      app.use(router.routes()).use(router.allowedMethods());
    }
  }

  private handlerFactory(
    execCtx: ExecutionContext,
    interceptors: InterceptorInfo[],
  ): koaRouter.IMiddleware {
    return async (
      context: koaRouter.IRouterContext,
      next: () => Promise<any>,
    ) => {
      const composeInterceptor = compose(interceptors, converterValue);
      const req = context.req;
      const ctx = getContext(req);
      const methodInfo = execCtx.getMethodInfo();
      const controller = execCtx.getClass();

      const callNext = async () => {
        const args = await methodInfo.extractArgs(ctx, execCtx, next);
        return await toPromise(controller[methodInfo.methodName](...args));
      };

      await composeInterceptor(ctx, execCtx, callNext);
    };
  }
}
