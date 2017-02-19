/// <reference types="express" />
import * as express from 'express';
import { HandlerDecorator } from '../interfaces';
export interface ControllerOptions {
    name?: string;
    path: string;
    middlewares?: express.RequestHandler[];
}
export declare function Controller(options: ControllerOptions | string): (target: any) => void;
export declare function RestController(options: ControllerOptions | string): (target: any) => void;
export declare function All(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Get(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Post(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Put(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Patch(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Head(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Delete(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
export declare function Method(method: string, path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator;
