import * as express from 'express';
import { ControllerMetadata, Controller, HandlerDecorator, ControllerMethodMetadata } from '../interfaces';
import { METADATA_KEY, TYPE } from '../constants';
import { inversifyInterfaces, injectable, register } from '@gabliam/core';
import { addMiddlewareMetadata } from '../metadata';

export interface ControllerOptions {
    name?: string;
    path: string;

    middlewares?: express.RequestHandler[];
}

export function Controller(options: ControllerOptions);
export function Controller(path: string);
export function Controller(options: ControllerOptions | string) {
    return function (target: any) {
        decorateController(options, target, false);
    };
}


export function RestController(options: ControllerOptions);
export function RestController(path: string);
export function RestController(options: ControllerOptions | string) {
    return function (target: any) {
        decorateController(options, target, true);
    };
}

function decorateController(options: ControllerOptions | string, target: any, json: boolean) {
    let path: string;
    let id: inversifyInterfaces.ServiceIdentifier<any> = target;
    let middlewares: express.RequestHandler[] = [];
    if (typeof options === 'string') {
        path = options;
    } else {
        path = options.path;
        middlewares = options.middlewares;
        if (options.name) {
            id = name;
        }
    }

    addMiddlewareMetadata(middlewares, target);

    let metadata: ControllerMetadata = { path, target, json };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
    injectable()(target);
    register(TYPE.Controller, {id, target})(target);
}

export function All(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('all', path, ...middlewares);
}

export function Get(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('get', path, ...middlewares);
}

export function Post(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('post', path, ...middlewares);
}

export function Put(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('put', path, ...middlewares);
}

export function Patch(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('patch', path, ...middlewares);
}

export function Head(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('head', path, ...middlewares);
}

export function Delete(path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return Method('delete', path, ...middlewares);
}

export function Method(method: string, path: string, ...middlewares: express.RequestHandler[]): HandlerDecorator {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        let metadata: ControllerMethodMetadata = { path, method, target, key };
        let metadataList: ControllerMethodMetadata[] = [];

        addMiddlewareMetadata(middlewares, target.constructor, key);
        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }

        metadataList.push(metadata);
    };
}
