import { Container, gabliamValue, Registry, toPromise } from '@gabliam/core';
import { APP, METADATA_KEY, TYPE } from './constants';
import { WebConfigMetadata } from './decorators';
import { RestMetadata } from './plugin-config';
import { extractControllerMetadata } from './utils';
import { ValidateInterceptor } from './validate';
import { WebConfiguration } from './web-configuration';
import { ValidateSendErrorInterceptor } from './validate/validate-senderror-interceptor';

/**
 * Base class for web plugin.
 */
export abstract class WebPluginBase {
  /**
   * Bind the app. In this method, you create the application and bind.
   *
   * @param  {Container} container - The container.
   * @param  {Registry} registry - The registry.
   * @param  {WebConfiguration} webConfiguration - The WebConfiguration instance for add configuration.
   * @returns gabliamValue
   */
  abstract bindApp(
    container: Container,
    registry: Registry,
    webConfiguration: WebConfiguration
  ): gabliamValue<void>;

  abstract buildControllers(
    restMetadata: RestMetadata,
    container: Container
  ): gabliamValue<void>;

  /**
   * binding phase
   *
   * @param  {Container} container - The container.
   * @param  {Registry} registry - The registry.
   */
  async bind(container: Container, registry: Registry) {
    // Bind all controller
    registry.get(TYPE.Controller).forEach(({ id, target }) =>
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope()
    );

    // Bind the validate interceptor
    container
      .bind(ValidateInterceptor)
      .to(ValidateInterceptor)
      .inSingletonScope();

    container
      .bind(ValidateSendErrorInterceptor)
      .to(ValidateSendErrorInterceptor)
      .inSingletonScope();

    const webConfiguration = new WebConfiguration();
    container.bind(WebConfiguration).toConstantValue(webConfiguration);
    await toPromise(this.bindApp(container, registry, webConfiguration));
  }

  /**
   * Building phase
   *
   * @param  {Container} container - The container
   * @param  {Registry} registry - The registry
   */
  async build(container: Container, registry: Registry) {
    this.buildWebConfig(container, registry);
    await toPromise(
      this.buildControllers(
        extractControllerMetadata(container, registry),
        container
      )
    );
    this.buildWebConfigAfterCtrl(container, registry);
  }

  /**
   * Management of @WebConfig and @WebConfigAfterControllers decorator in config class
   *
   * @param  {Container} container - The container
   * @param  {Registry} registry - The registry
   * @param  {any} confInstance - The current instance of confi class
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
}
