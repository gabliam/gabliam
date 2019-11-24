import {
  Container,
  gabliamValue,
  reflection,
  Registry,
  Scan,
  toPromise,
} from '@gabliam/core';
import {
  APP,
  REQUEST_LISTENER_CREATOR,
  SERVER,
  WEB_PLUGIN_CONFIG,
} from './constants';
import { RequestListenerCreator } from './interface';
import { WebConfig, WebConfigAfterControllers } from './metadatas';
import { RestMetadata, WebPluginConfig } from './plugin-config';
import { extractControllerMetadata } from './utils';
import {
  WebConfiguration,
  WebConfigurationContructor,
} from './web-configuration';

/**
 * Base class for web plugin.
 */
@Scan()
export abstract class WebPluginBase<T> {
  private webConfiguration: WebConfiguration<T>;

  constructor(config?: Partial<WebConfigurationContructor<T>>) {
    this.webConfiguration = new WebConfiguration(config);
  }

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
    const webConfiguration = this.webConfiguration;
    container.bind(WebConfiguration).toConstantValue(webConfiguration);
    await toPromise(this.bindApp(container, registry, webConfiguration));
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

    const webConfigList = reflection.propMetadataOfDecorator<WebConfig>(
      confInstance.constructor,
      WebConfig
    );
    for (const [key, webConfigs] of Object.entries(webConfigList)) {
      const [{ order }] = webConfigs.slice(-1);
      webConfig.addwebConfig({
        order,
        instance: confInstance[key].bind(confInstance[key]),
      });
    }

    const webConfigAfterCtlsList = reflection.propMetadataOfDecorator<
      WebConfigAfterControllers
    >(confInstance.constructor, WebConfigAfterControllers);
    for (const [key, webConfigs] of Object.entries(webConfigAfterCtlsList)) {
      const [{ order }] = webConfigs.slice(-1);
      webConfig.addWebConfigAfterCtrl({
        order,
        instance: confInstance[key].bind(confInstance[key]),
      });
    }
  }

  abstract destroy(
    container: Container,
    registry: Registry
  ): gabliamValue<void>;

  async start(container: Container, registry: Registry) {
    this.buildWebConfig(container, registry);
    await toPromise(
      this.buildControllers(
        extractControllerMetadata(container, registry),
        container
      )
    );
    this.buildWebConfigAfterCtrl(container, registry);

    const restConfig = container.get<WebPluginConfig>(WEB_PLUGIN_CONFIG);
    const webConfiguration = container.get(WebConfiguration);
    const serverStarter = webConfiguration.serverStarter;

    const listenerCreator = container.get<RequestListenerCreator>(
      REQUEST_LISTENER_CREATOR
    );

    const server = await toPromise(
      serverStarter.start(restConfig, webConfiguration, listenerCreator)
    );
    container.bind(SERVER).toConstantValue(server);
  }

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
