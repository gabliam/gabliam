import { DefaultMethods } from '@gabliam/web-core';
import { express } from './express';

/**
 * Represent a method that create an express router
 */
export type RouterCreator = () => express.Router;

export type ExpressMethods = Extract<keyof express.Router, DefaultMethods>;
