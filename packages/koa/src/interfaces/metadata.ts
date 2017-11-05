import { MiddlewareDefinition } from './interfaces';
import { inversifyInterfaces } from '@gabliam/core';
import { koaRouter } from '../koa';

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
   * method use for koa router
   * get, all, put ...
   */
  method: string;

  /**
   * Key of the method
   */
  key: string;
}

/**
 * Koa Config Metadata
 */
export interface KoaConfigMetadata {
  /**
   * id of class config
   */
  id: inversifyInterfaces.ServiceIdentifier<any>;

  /**
   * key of the method that has an koa config
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
  | koaRouter.IMiddleware
  | MiddlewareDefinition
  | inversifyInterfaces.ServiceIdentifier<any>;
