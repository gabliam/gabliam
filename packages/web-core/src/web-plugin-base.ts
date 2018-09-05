import {
  Container,
  gabliamValue,
  Registry,
  ValueExtractor,
  VALUE_EXTRACTOR,
} from '@gabliam/core';
import * as EscapeHtml from 'escape-html';
import {
  APP,
  DEFAULT_PARAM_VALUE,
  METADATA_KEY,
  PARAMETER_TYPE,
  TYPE,
  WEB_PLUGIN_CONFIG,
} from './constants';
import {
  ControllerMetadata,
  ControllerMethodMetadata,
  ControllerParameterMetadata,
  getInterceptors,
  ParameterMetadata,
  WebConfigMetadata,
} from './decorators';
import { GabContext } from './gab-context';
import { PluginConfig, RestMetadata } from './plugin-config';
import { cleanPath } from './utils';
import { ValidationError } from './validate-request';
import { WebConfiguration } from './web-configuration';

export abstract class WebPluginBase {
  abstract bindApp(container: Container, registry: Registry, app: Symbol): void;

  abstract buildControllers(
    restMetadata: RestMetadata,
    container: Container
  ): void;

  /**
   * binding phase
   *
   * Bind all controller and bind express app
   * @param  {Container} container
   * @param  {Registry} registry
   */
  bind(container: Container, registry: Registry) {
    this.bindApp(container, registry, APP);
    registry.get(TYPE.Controller).forEach(({ id, target }) =>
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope()
    );

    container.bind(WebConfiguration).toConstantValue(new WebConfiguration());
  }

  build(container: Container, registry: Registry) {
    this.buildWebConfig(container, registry);
    this.buildControllers(
      this.extractControllerMetadata(container, registry),
      container
    );
    this.buildWebConfigAfterCtrl(container, registry);
  }

  /**
   * Management of @middleware decorator in config class
   *
   * @param  {Container} container
   * @param  {Registry} registry
   * @param  {any} confInstance
   */
  config(container: Container, registry: Registry, confInstance: any) {
    const webConfig = container.get(WebConfiguration);

    // if config class has a @middleware decorator, add in this.middlewares for add it in building phase
    if (Reflect.hasMetadata(METADATA_KEY.webConfig, confInstance.constructor)) {
      const metadataList: WebConfigMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.webConfig,
        confInstance.constructor
      );

      metadataList.forEach(({ key, order }) => {
        webConfig.addwebConfig({
          order,
          instance: confInstance[key].bind(confInstance[key]),
        });
      });
    }

    // if config class has a @middleware decorator, add in this.errorMiddlewares for add it in building phase
    if (
      Reflect.hasMetadata(
        METADATA_KEY.webConfigAfterControllers,
        confInstance.constructor
      )
    ) {
      const metadataList: WebConfigMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.webConfigAfterControllers,
        confInstance.constructor
      );

      metadataList.forEach(({ key, order }) => {
        webConfig.addWebConfigAfterCtrl({
          order,
          instance: confInstance[key].bind(confInstance[key]),
        });
      });
    }
  }

  abstract destroy(
    container: Container,
    registry: Registry
  ): gabliamValue<void>;

  abstract stop(container: Container, registry: Registry): gabliamValue<void>;

  protected getValidateError(err: ValidationError) {
    const error: any = {
      statusCode: 400,
      error: 'Bad Request',
      message: err.message,
      validation: {
        source: err._meta.source,
        keys: [],
      },
    };

    if (err.details) {
      for (let i = 0; i < err.details.length; i += 1) {
        /* istanbul ignore next */
        const path: string = Array.isArray(err.details[i].path)
          ? err.details[i].path.join('.')
          : (err.details[i].path as any);
        error.validation.keys.push(EscapeHtml(path));
      }
    }
  }

  protected extractParameters<T>(
    target: any,
    key: string,
    ctx: GabContext,
    next: T,
    params: ParameterMetadata[]
  ): any[] {
    const args = [];
    if (!params || !params.length) {
      return [ctx.request, ctx.response, next];
    }

    // create de param getter
    const getParam = this.getFuncParam(target, key);
    for (const item of params) {
      switch (item.type) {
        case PARAMETER_TYPE.CONTEXT:
        default:
          args[item.index] = ctx;
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

    return args;
  }

  /**
   * Build express middleware
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private buildWebConfig(container: Container, registry: Registry) {
    const middlewareConfig = container.get(WebConfiguration);
    const app = container.get(APP);
    middlewareConfig.webConfigs
      .sort((a, b) => a.order - b.order)
      .forEach(({ instance }) => instance(app, container));
  }

  /**
   * Build express error middleware
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private buildWebConfigAfterCtrl(container: Container, registry: Registry) {
    const middlewareConfig = container.get(WebConfiguration);

    const app = container.get(APP);
    middlewareConfig.WebConfigAfterCtrls.sort(
      (a, b) => a.order - b.order
    ).forEach(({ instance }) => instance(app, container));
  }

  /**
   * Build all controllers
   *
   * @param  {Container} container
   * @param  {Registry} registry
   */
  private extractControllerMetadata(container: Container, registry: Registry) {
    const restConfig = container.get<PluginConfig>(WEB_PLUGIN_CONFIG);
    const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

    const controllerIds = registry.get(TYPE.Controller);
    const restMetadata: RestMetadata = {
      ...restConfig,
      controllers: [],
    };

    controllerIds.forEach(({ id: controllerId }) => {
      const controller = container.get<object>(controllerId);

      const controllerMetadata: ControllerMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controller,
        controller.constructor
      );

      const controllerInterceptors = getInterceptors(
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
        methodMetadatas.forEach((methodMetadata: ControllerMethodMetadata) => {
          let paramList: ParameterMetadata[] = [];
          if (parameterMetadata) {
            paramList = parameterMetadata.get(methodMetadata.key) || [];
          }
          let methodPath = cleanPath(
            valueExtractor(methodMetadata.path, methodMetadata.path)
          );

          if (methodPath[0] !== '/') {
            methodPath = '/' + methodPath;
          }

          const methodInterceptors = getInterceptors(
            container,
            controller.constructor,
            methodMetadata.key
          );

          restMetadata.controllers.push({
            controllerId,
            methodName: methodMetadata.key,
            json: controllerMetadata.json,
            paramList,
            methodPath,
            controllerInterceptors,
            methodInterceptors,
          });
        });
      }
    });

    return restMetadata;
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
