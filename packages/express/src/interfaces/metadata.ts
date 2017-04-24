import * as express from 'express';
import { MiddlewareDefinition } from './interfaces';
import { inversifyInterfaces } from '@gabliam/core';

export interface ControllerMetadata {
    path: string;
    target: any;
    json?: boolean;
}

export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string;
    key: string;
}

export interface ExpressConfigMetadata {
    id: inversifyInterfaces.ServiceIdentifier<any>;

    key: string;
}

export type MiddlewareMetadata = express.RequestHandler | MiddlewareDefinition;
