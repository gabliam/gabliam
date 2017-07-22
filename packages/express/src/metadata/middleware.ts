import { inversifyInterfaces } from '@gabliam/core';
import * as express from 'express';
import { MiddlewareMetadata, MiddlewareConfigurator } from '../interfaces';
import { METADATA_KEY } from '../constants';
import { isMiddlewareDefinition } from '../utils';

/**
 * Add middlewares metadata.
 *  If key is undefined, add the list of middlewares for a class (target)
 *  else add the list of middlewares for a method (key) of a class (target)
 *
 * @param  {MiddlewareMetadata[]} middlewares
 * @param  {Object} target
 * @param  {string} key?
 */
export function addMiddlewareMetadata(
  middlewares: MiddlewareMetadata[],
  target: Object,
  key?: string
) {
  let metadataList: MiddlewareMetadata[] = [];

  // add key! for disable false error
  // if key is undefined => middleware metadata for class else for method
  if (!Reflect.hasOwnMetadata(METADATA_KEY.middleware, target, key!)) {
    Reflect.defineMetadata(METADATA_KEY.middleware, metadataList, target, key!);
  } else {
    metadataList = Reflect.getOwnMetadata(
      METADATA_KEY.middleware,
      target,
      key!
    );
  }

  metadataList.push(...middlewares);
}

/**
 * Get middlewares metadata.
 * If key is undefined, return the list of middlewares for a class (target)
 *  else return the list of middlewares for a method (key) of a class (target)
 * @param  {inversifyInterfaces.Container} container
 * @param  {Object} target
 * @param  {string} key?
 * @returns express.RequestHandler[]
 */
export function getMiddlewares(
  container: inversifyInterfaces.Container,
  target: Object,
  key?: string
): express.RequestHandler[] {
  let metadataList: MiddlewareMetadata[] = [];
  if (Reflect.hasOwnMetadata(METADATA_KEY.middleware, target, key!)) {
    metadataList = Reflect.getOwnMetadata(
      METADATA_KEY.middleware,
      target,
      key!
    );
  }

  function resolveMiddleware(
    middleware: MiddlewareMetadata
  ): express.RequestHandler {
    try {
      return container.get<express.RequestHandler>(
        <inversifyInterfaces.ServiceIdentifier<any>>middleware
      );
    } catch (e) {
      return <express.RequestHandler>middleware;
    }
  }

  return metadataList.reduce<express.RequestHandler[]>((prev, metadata) => {
    if (isMiddlewareDefinition(metadata)) {
      const middleware = container.get<MiddlewareConfigurator>(
        `${metadata.name}Middleware`
      )(...metadata.values);
      if (Array.isArray(middleware)) {
        prev.push(...middleware);
      } else {
        prev.push(middleware);
      }
    } else {
      prev.push(resolveMiddleware(metadata));
    }

    return prev;
  }, []);
}
