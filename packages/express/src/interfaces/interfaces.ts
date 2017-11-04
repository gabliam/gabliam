import { PARAMETER_TYPE } from '../constants';
import { express } from '../express';

/**
 * Handler decorator
 */
export type HandlerDecorator = (target: any, key: string, value: any) => void;

/**
 * Config for express plugin
 */
export interface ExpressPluginConfig {
  /**
   * Root path of express plugin
   */
  rootPath: string;

  /**
   * Port of express
   */
  port: number;

  /**
   * Hostname of express
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
) => express.RequestHandler | express.RequestHandler[];

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
 * For configure express application
 */
export type ConfigFunction = (app: express.Application) => void;

/**
 * Express configuration
 */
export interface ExpressConfiguration {
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
 * Represent a method that create an express router
 */
export type RouterCreator = () => express.Router;
