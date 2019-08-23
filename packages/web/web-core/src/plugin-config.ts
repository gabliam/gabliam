import {
  Bean,
  inversifyInterfaces,
  Joi,
  PluginConfig,
  Value,
} from '@gabliam/core';
import { WEB_PLUGIN_CONFIG } from './constants';
import { InterceptorInfo } from './interceptors';
import { extractArgsFn } from './interface';

export interface WebPluginConfig {
  /**
   * Root path
   */
  rootPath: string;

  /**
   * Port
   */
  port: number;

  /**
   * Hostname
   */
  hostname: string;

  /**
   * Verbose start server
   * default: true
   */
  verbose: boolean;
}

export interface RestMetadata<T = string> extends WebPluginConfig {
  controllerInfo: Map<
    inversifyInterfaces.ServiceIdentifier<any>,
    ControllerInfo<T>
  >;
}

export interface ControllerInfo<T = string> {
  controllerPath: string;

  methods: MethodInfo<T>[];
}

export interface MethodInfo<T = string> {
  controllerId: inversifyInterfaces.ServiceIdentifier<any>;
  methodName: string;
  json: boolean;
  extractArgs: extractArgsFn;
  methodPath: string;
  method: T;
  interceptors: InterceptorInfo[];
}

@PluginConfig()
export class WebPluginBaseConfig {
  @Value('application.web.rootPath', Joi.string())
  rootPath = '/';

  @Value('application.web.port', Joi.number().positive())
  port: number = process.env.PORT ? parseInt(process.env.PORT!, 10) : 3000;

  @Value('application.web.hostname', Joi.string())
  hostname: string;

  @Value('application.web.verbose', Joi.bool())
  verbose = true;

  @Bean(WEB_PLUGIN_CONFIG)
  restConfig(): WebPluginConfig {
    return {
      rootPath: this.rootPath,
      port: this.port,
      hostname: this.hostname,
      verbose: this.verbose,
    };
  }
}
