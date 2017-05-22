import * as express from 'express';
import { MiddlewareDefinition } from './interfaces';
import { inversifyInterfaces } from '@gabliam/core';

export interface ControllerMetadata {
  path: string;

  json: boolean;
}

export interface ControllerMethodMetadata {
  path: string;

  method: string;

  key: string;
}

export interface ExpressConfigMetadata {
  id: inversifyInterfaces.ServiceIdentifier<any>;

  key: string;

  order: number;
}

export type MiddlewareMetadata = express.RequestHandler | MiddlewareDefinition;
