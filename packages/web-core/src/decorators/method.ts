import {
  HandlerDecorator,
  ControllerMethodMetadata,
  MiddlewareMetadata
} from '../interfaces';
import { METADATA_KEY } from '../constants';
import { addMiddlewareMetadata } from '../metadata';

export type RestParamDecorator<T> = (
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
) => HandlerDecorator;

export type RestMethodDecorator<T> = (
  method: string,
  path: string,
  ...middlewares: MiddlewareMetadata<T>[]
) => HandlerDecorator;

export function createMethodDecorator<T>(method: string) {
  return (path: string, ...middlewares: MiddlewareMetadata<T>[]) => (
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) => {
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
