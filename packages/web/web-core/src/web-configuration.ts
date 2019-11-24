import { Container, inversifyInterfaces } from '@gabliam/core';
import { SendErrorInterceptor } from './interceptors';
import { ServerConfig } from './interface';
import { PipeId } from './metadatas';
import { HttpServerStarter, ServerStarter } from './server-starter';

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

export interface WebConfigurationContructor<T = any> {
  /**
   * All web config
   *
   * Function call before build controller
   *
   * For add configuration of you server (express or koa middleware)
   */
  webconfig: Configuration<T>[];

  /**
   * All web config
   *
   * Function call after build controller
   *
   * For add configuration of you server (express middleware of error)
   */
  webconfigAfterCtrl: Configuration<T>[];

  /**
   * All interceptors.
   * Call on all methods
   */
  globalInterceptors: inversifyInterfaces.ServiceIdentifier<any>[];

  /**
   * All pipes.
   * Call on all methods
   */
  globalPipes: PipeId[];

  /**
   * All pipes.
   * Call on all methods
   */
  serverConfigs: ServerConfig[];

  /**
   * Inlude Error Interceptor
   * By default true
   */
  includeErrorInterceptor: boolean;

  /**
   * Server starter
   *
   * By default HttpServerStarter
   */
  serverStarter: ServerStarter;
}

/**
 * Web Config
 *
 * This class is a storage of all web configuration
 */
export class WebConfiguration<T = any> {
  private _webconfig: Configuration<T>[] = [];

  private _webconfigAfterCtrl: Configuration<T>[] = [];

  private _globalInterceptors: inversifyInterfaces.ServiceIdentifier<
    any
  >[] = [];
  private _globalPipes: PipeId[] = [];

  private _serverConfigs: ServerConfig[] = [];

  private _serverStarter: ServerStarter;

  constructor(config?: Partial<WebConfigurationContructor<T>>) {
    this._serverStarter = config?.serverStarter ?? new HttpServerStarter();

    if (config?.includeErrorInterceptor ?? true) {
      this._globalInterceptors.push(SendErrorInterceptor);
    }

    if (config?.webconfig) {
      this._webconfig.push(...config.webconfig);
    }
    if (config?.webconfigAfterCtrl) {
      this._webconfigAfterCtrl.push(...config.webconfigAfterCtrl);
    }

    if (config?.globalInterceptors) {
      this._globalInterceptors.push(...config.globalInterceptors);
    }

    if (config?.globalPipes) {
      this._globalPipes.push(...config.globalPipes);
    }

    if (config?.serverConfigs) {
      this._serverConfigs.push(...config.serverConfigs);
    }
  }

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

  get serverStarter() {
    return this._serverStarter;
  }
}
