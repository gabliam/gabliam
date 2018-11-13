import { METADATA_KEY } from '../constants';

export type defaultMethods =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'head'
  | 'delete';

/**
 * Controller method metadata
 */
export interface ControllerMethodMetadata {
  /**
   * path of the method
   */
  path: string;

  /**
   * method use for express router
   * get, all, put ...
   */
  method: string;

  /**
   * Key of the method
   */
  key: string;
}

export const All = createMethodDecorator('all');

export const Get = createMethodDecorator('get');

export const Post = createMethodDecorator('post');

export const Put = createMethodDecorator('put');

export const Patch = createMethodDecorator('patch');

export const Head = createMethodDecorator('head');

export const Delete = createMethodDecorator('delete');

export const Method = (method: string, path: string) => {
  return createMethodDecorator(method)(path);
};

export function createMethodDecorator(method: string) {
  return (path: string) => (
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) => {
    const metadata: ControllerMethodMetadata = { path, method, key };
    let metadataList: ControllerMethodMetadata[] = [];
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
