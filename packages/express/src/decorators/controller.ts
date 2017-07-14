import * as express from 'express';
import { ControllerMetadata } from '../interfaces';
import { METADATA_KEY, TYPE, ERRORS_MSGS } from '../constants';
import { inversifyInterfaces, injectable, register } from '@gabliam/core';
import { addMiddlewareMetadata } from '../metadata';

export interface ControllerOptions {
  name?: string;

  path: string;

  middlewares?: express.RequestHandler[];
}

export function Controller(options: ControllerOptions | string) {
  return function(target: any) {
    decorateController(options, target, false);
  };
}

export function RestController(options: ControllerOptions | string) {
  return function(target: any) {
    decorateController(options, target, true);
  };
}

function decorateController(
  options: ControllerOptions | string,
  target: any,
  json: boolean
) {
  if (Reflect.hasOwnMetadata(METADATA_KEY.controller, target) === true) {
    throw new Error(ERRORS_MSGS.DUPLICATED_CONFIG_DECORATOR);
  }

  let path: string;
  let id: inversifyInterfaces.ServiceIdentifier<any> = target;
  let middlewares: express.RequestHandler[] = [];
  if (typeof options === 'string') {
    path = options;
  } else {
    path = options.path;
    middlewares = options.middlewares || [];
    if (options.name) {
      id = options.name;
    }
  }

  addMiddlewareMetadata(middlewares, target);

  const metadata: ControllerMetadata = { path, json };
  Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  injectable()(target);
  register(TYPE.Controller, { id, target })(target);
}
