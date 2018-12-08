import { koaRouter } from './koa';
import { defaultMethods } from '@gabliam/web-core';
/**
 * Represent a method that create an koa router
 */
export type RouterCreator = (path?: string) => koaRouter;

type Filter<T, U> = T extends U ? T : never;

export type KoaMethods = Filter<keyof koaRouter, defaultMethods>;
