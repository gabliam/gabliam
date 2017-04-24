import { inversifyInterfaces } from '@gabliam/core';
import * as express from 'express';
import { MiddlewareMetadata, MiddlewareConfigurator } from '../interfaces';
import { METADATA_KEY } from '../constants';
import { isMiddlewareDefinition } from '../utils';

export function addMiddlewareMetadata(middlewares: MiddlewareMetadata[], target: Object, key?: string) {
    let metadataList: MiddlewareMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.middleware, target, key)) {
        Reflect.defineMetadata(METADATA_KEY.middleware, metadataList, target, key);
    } else {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.middleware, target, key);
    }

    metadataList.push(...middlewares);
}

export function getMiddlewares(container: inversifyInterfaces.Container, target: Object, key?: string): express.RequestHandler[] {
    let metadataList: MiddlewareMetadata[] = [];
    if (Reflect.hasOwnMetadata(METADATA_KEY.middleware, target, key)) {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.middleware, target, key);
    }

    return metadataList
        .reduce<express.RequestHandler[]>((prev, metadata) => {
            if (isMiddlewareDefinition(metadata)) {
                let middleware = container.get<MiddlewareConfigurator>(`${metadata.name}Middleware`)(...metadata.values);
                if (Array.isArray(middleware)) {
                    prev.push(...middleware);
                } else {
                    prev.push(middleware);
                }
            } else {
                prev.push(metadata);
            }

            return prev;
        }, []);
}
