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

export interface ConfigMethodMetadata {
    id: interfaces.ServiceIdentifier<any>;
    key: string;
    target: any;
}