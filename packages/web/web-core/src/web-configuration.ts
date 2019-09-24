import {
  Bean,
  Container,
  inversifyInterfaces,
  OnMissingBean,
  PluginConfig,
} from '@gabliam/core';
import { SERVER_STARTER } from './constants';
import { SendErrorInterceptor } from './interceptors';
import { PipeId } from './metadatas';
import { HttpServerStarter } from './server-starter';
import { ServerConfig } from './interface';

/**
 * Config function
 *
 * For configure application
 */
export type ConfigFunction<T = any> = (app: T, container: Container) => void;

/**
 * Configuration
 */
export interface Configuration<T = any> {
  /**
   * execution order
   */
  order: number;

  /**
   * instance of configFunction
   */
  instance: ConfigFunction<T>;
}

/**
 * Web Config
 *
 * This class is a storage of all web configuration
 */
export class WebConfiguration<T = any> {
  private _webconfig: Configuration<T>[] = [];

  private _webconfigAfterCtrl: Configuration<T>[] = [];

  private _globalInterceptors: inversifyInterfaces.ServiceIdentifier<any>[] = [
    SendErrorInterceptor,
  ];
  private _globalPipes: PipeId[] = [];

  private _serverConfigs: ServerConfig[] = [];

  addwebConfig(webConfig: Configuration<T>) {
    this._webconfig.push(webConfig);
  }

  addWebConfigAfterCtrl(webConfig: Configuration<T>) {
    this._webconfigAfterCtrl.push(webConfig);
  }

  useGlobalInterceptor(...ids: inversifyInterfaces.ServiceIdentifier<any>[]) {
    this._globalInterceptors.push(...ids);
  }

  useGlobalPipes(...ids: inversifyInterfaces.ServiceIdentifier<any>[]) {
    this._globalPipes.push(...ids);
  }

  addServerConfigs(...configs: ServerConfig[]) {
    this._serverConfigs.push(...configs);
  }

  get webConfigs() {
    return this._webconfig.slice();
  }

  get WebConfigAfterCtrls() {
    return this._webconfigAfterCtrl.slice();
  }

  get globalInterceptors() {
    return this._globalInterceptors;
  }

  get globalPipes() {
    return this._globalPipes;
  }

  get serverConfigs() {
    return this._serverConfigs;
  }
}

@PluginConfig()
export class BaseConfig {
  @OnMissingBean(SERVER_STARTER)
  @Bean(SERVER_STARTER)
  createServerStarter() {
    return new HttpServerStarter();
  }
}
