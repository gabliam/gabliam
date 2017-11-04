import { MiddlewareDefinition } from './interfaces';
import { inversifyInterfaces } from '@gabliam/core';
import { express } from '../express';

/**
 * Controller metadata
 */
export interface ControllerMetadata {
  /**
   * path for the controller
   * this path is concatenated with path of each method
   */
  path: string;

  /**
   * If a method return a value :
   *  - if true : res.json
   *  - if false: res.send
   */
  json: boolean;
}

/**
 * Controller method metadata
 */
export interface ControllerMethodMetadata {
  /**
   * path of the method
   */
  path: string;

  /**
   * method use for express router
   * get, all, put ...
   */
  method: string;

  /**
   * Key of the method
   */
  key: string;
}

/**
 * Express Config Metadata
 */
export interface ExpressConfigMetadata {
  /**
   * id of class config
   */
  id: inversifyInterfaces.ServiceIdentifier<any>;

  /**
   * key of the method that has an express config
   */
  key: string;

  /**
   * order of execute of the config
   */
  order: number;
}

/**
 * Middleware Metadata
 */
export type MiddlewareMetadata =
  | express.RequestHandler
  | MiddlewareDefinition
  | inversifyInterfaces.ServiceIdentifier<any>;
