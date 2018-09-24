import { inversifyInterfaces } from '@gabliam/core';
import { Interceptors, ParameterMetadata } from './decorators';

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
}

export interface RestMetadata extends WebPluginConfig {
  controllerInfo: Map<
    inversifyInterfaces.ServiceIdentifier<any>,
    ControllerInfo
  >;
}

export interface ControllerInfo {
  controllerPath: string;

  methods: MethodInfo[];
}

export interface MethodInfo {
  controllerId: inversifyInterfaces.ServiceIdentifier<any>;
  methodName: string;
  json: boolean;
  paramList: ParameterMetadata[];
  methodPath: string;
  method: string;
  controllerInterceptors: Interceptors;
  methodInterceptors: Interceptors;
}
