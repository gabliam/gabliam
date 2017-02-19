/// <reference types="express" />
import * as express from 'express';
import { Gabliam } from '../gabliam';
import { interfaces } from "inversify";
export interface Controller {
}
export interface HandlerDecorator {
    (target: any, key: string, value: any): void;
}
export interface ConfigFunction {
    (app: express.Application): void;
}
export interface RoutingConfig {
    rootPath: string;
}
export declare type ModuleFunction = (framework: Gabliam) => Promise<void>;
export interface Config {
}
export interface ConfigRegistry {
    order: number;
    id: interfaces.ServiceIdentifier<any>;
}
