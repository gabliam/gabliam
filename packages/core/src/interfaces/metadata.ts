import * as express from 'express';
import { interfaces } from "inversify";

export interface ControllerMetadata {
    path: string;
    middlewares: express.RequestHandler[];
    target: any;
    json?: boolean;
}

export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string;
    key: string;
}

export interface BeanMetadata {
    id: interfaces.ServiceIdentifier<any>;
    key: string;
    target: any;
}

export interface ValueMetadata {
    path: string;
    key: string;
    target: any;
}