import { PARAMETER_TYPE } from '../constants';

/**
 * Handler decorator
 */
export type HandlerDecorator = (target: any, key: string, value: any) => void;

/**
 * MiddlewareConfigurator
 *
 * Define a function that return a requestHandler
 */
export type MiddlewareConfigurator<T> = (...values: any[]) => T | T[];

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
export type ConfigFunction<T> = (app: T) => void;

/**
 * Express configuration
 */
export interface Configuration<T> {
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
