import { PARAMETER_TYPE } from '../constants';
import { koa, koaRouter } from '../koa';

/**
 * Handler decorator
 */
export type HandlerDecorator = (target: any, key: string, value: any) => void;

/**
 * Config for koa plugin
 */
export interface KoaPluginConfig {
  /**
   * Root path of koa plugin
   */
  rootPath: string;

  /**
   * Port of koa
   */
  port: number;

  /**
   * Hostname of koa
   */
  hostname: string;
}

/**
 * MiddlewareConfigurator
 *
 * Define a function that return a requestHandler
 */
export type MiddlewareConfigurator = (
  ...values: any[]
) => koaRouter.IMiddleware | koaRouter.IMiddleware[];

/**
 * Middleware definition
 */
export interface MiddlewareDefinition {
  /**
   * name of middleware
   */
  name: string;

  /**
   * values ​​to go to the middleware
   */
  values: any[];
}

/**
 * Config function
 *
 * For configure koa application
 */
export type ConfigFunction = (app: koa) => void;

/**
 * koa configuration
 */
export interface KoaConfiguration {
  /**
   * execution order
   */
  order: number;

  /**
   * instance of configFunction
   */
  instance: ConfigFunction;
}

/**
 * Represent all parameters metadata for a controller
 */
export interface ControllerParameterMetadata {
  [methodName: string]: ParameterMetadata[];
}

/**
 * Parameter metadata
 */
export interface ParameterMetadata {
  /**
   * Parameter name
   */
  parameterName: string;

  /**
   * Index of the parameter
   */
  index: number;

  /**
   * Type of parameter
   */
  type: PARAMETER_TYPE;
}

/**
 * Represent a method that create an koa router
 */
export type RouterCreator = (path?: string) => koaRouter;
