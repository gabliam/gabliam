import { express } from './express';

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
 * Represent a method that create an express router
 */
export type RouterCreator = () => express.Router;
