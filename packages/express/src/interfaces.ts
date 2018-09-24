import { express } from './express';

/**
 * Represent a method that create an express router
 */
export type RouterCreator = () => express.Router;
