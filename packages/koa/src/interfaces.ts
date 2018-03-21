import { koaRouter } from './koa';

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
 * Represent a method that create an koa router
 */
export type RouterCreator = (path?: string) => koaRouter;
