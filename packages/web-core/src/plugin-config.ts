import { inversifyInterfaces } from '@gabliam/core';
import { ParameterMetadata, Interceptor } from './decorators';

export interface PluginConfig {
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
}

export interface RestMetadata extends PluginConfig {
  controllers: ControllerInfo[];
}

export interface ControllerInfo {
  controllerId: inversifyInterfaces.ServiceIdentifier<any>;
  methodName: string;
  json: boolean;
  paramList: ParameterMetadata[];
  methodPath: string;
  controllerInterceptors: Interceptor[];
  methodInterceptors: Interceptor[];
}
