import { inversifyInterfaces } from '@gabliam/core';
import { ParameterMetadata, InterceptorInfo } from './decorators';

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
  paramList: ParameterMetadata[];
  methodPath: string;
  method: T;
  interceptors: InterceptorInfo[];
}
