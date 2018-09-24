import {
  Container,
  gabliamValue,
  Registry,
  ValueExtractor,
  VALUE_EXTRACTOR,
} from '@gabliam/core';
import { APP, METADATA_KEY, TYPE, WEB_PLUGIN_CONFIG } from './constants';
import {
  ControllerMetadata,
  ControllerMethodMetadata,
  ControllerParameterMetadata,
  getInterceptors,
  ParameterMetadata,
  WebConfigMetadata,
} from './decorators';
import { MethodInfo, WebPluginConfig, RestMetadata } from './plugin-config';
import { cleanPath } from './utils';
import {
  getValidateInterceptor,
  ValidateInterceptor,
} from './validate-interceptor';
import { WebConfiguration } from './web-configuration';

export abstract class WebPluginBase {
  abstract bindApp(
    container: Container,
    registry: Registry,
    webConfiguration: WebConfiguration
  ): void;

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
    registry.get(TYPE.Controller).forEach(({ id, target }) =>
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope()
    );
    container
      .bind(ValidateInterceptor)
      .to(ValidateInterceptor)
      .inSingletonScope();
    const webConfiguration = new WebConfiguration();
    container.bind(WebConfiguration).toConstantValue(webConfiguration);
    this.bindApp(container, registry, webConfiguration);
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
    const restConfig = container.get<WebPluginConfig>(WEB_PLUGIN_CONFIG);
    const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

    const controllerIds = registry.get(TYPE.Controller);
    const restMetadata: RestMetadata = {
      ...restConfig,
      controllerInfo: new Map(),
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
        const controllerPath = valueExtractor(
          controllerMetadata.path,
          controllerMetadata.path
        );

        const methods: MethodInfo[] = [];

        restMetadata.controllerInfo.set(controllerId, {
          controllerPath,
          methods,
        });
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

          methodInterceptors.interceptors.unshift(
            getValidateInterceptor(container)
          );

          methods.push({
            controllerId,
            methodName: methodMetadata.key,
            json: controllerMetadata.json,
            paramList,
            methodPath,
            method: methodMetadata.method,
            controllerInterceptors,
            methodInterceptors,
          });
        });
      }
    });

    return restMetadata;
  }
}
