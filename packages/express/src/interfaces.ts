import { express } from './express';
import { defaultMethods } from '@gabliam/web-core';

/**
 * Represent a method that create an express router
 */
export type RouterCreator = () => express.Router;

export type ExpressMethods = Extract<keyof express.Router, defaultMethods>;
