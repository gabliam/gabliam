import {
  HandlerDecorator,
  ControllerMethodMetadata,
  MiddlewareMetadata
} from '../interfaces';
import { METADATA_KEY } from '../constants';
import { addMiddlewareMetadata } from '../metadata';

export function All<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('all', path, ...middlewares);
}

export function Get<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('get', path, ...middlewares);
}

export function Post<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('post', path, ...middlewares);
}

export function Put<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('put', path, ...middlewares);
}

export function Patch<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('patch', path, ...middlewares);
}

export function Head<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('head', path, ...middlewares);
}

export function Delete<T>(
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return Method('delete', path, ...middlewares);
}

export function Method<T>(
  method: string,
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
): HandlerDecorator {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const metadata: ControllerMethodMetadata = { path, method, key };
    let metadataList: ControllerMethodMetadata[] = [];

    addMiddlewareMetadata(middlewares, target.constructor, key);
    if (
      !Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)
    ) {
      Reflect.defineMetadata(
        METADATA_KEY.controllerMethod,
        metadataList,
        target.constructor
      );
    } else {
      metadataList = Reflect.getOwnMetadata(
        METADATA_KEY.controllerMethod,
        target.constructor
      );
    }

    metadataList.push(metadata);
  };
}
