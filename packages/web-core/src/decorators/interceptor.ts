import { Container, gabliamValue, inversifyInterfaces } from '@gabliam/core';
import { METADATA_KEY } from '../constants';
import { getParameterMetadata, ParameterMetadata } from './params';

export type InterceptorMetadata = inversifyInterfaces.ServiceIdentifier<any>;

/**
 * InterceptorConstructor
 */
export type InterceptorConstructor =
  | { new (): Interceptor }
  | { new (): AfterResponseInterceptor };

/**
 * Interceptor
 */
export interface Interceptor {
  intercept(...args: any[]): gabliamValue<any>;
}

/**
 * After response interceptor
 */
export interface AfterResponseInterceptor {
  afterResponse(...args: any[]): gabliamValue<any>;
}

export function isInterceptor(value: any): value is Interceptor {
  return value && typeof value.intercept === 'function';
}

export function isAfterResponseInterceptor(
  value: any
): value is AfterResponseInterceptor {
  return value && typeof value.afterResponse === 'function';
}

export type InterceptorMethod = keyof (AfterResponseInterceptor & Interceptor);

/**
 * Interceptor decorator
 *
 * Injection of interceptor that are created with @Service
 * interceptor can be inject at the top of controller (The interceptor is valid for all method) or on method
 *
 * ## Simple Example
 *
 * @RestController()
 * class Sample {
 *  @Interceptor('log')
 *  @Get('/hello')
 *  hello() {
 *  return 'hello world';
 *  }
 * }
 *
 * @param  {string} name name of interceptor to inject
 * @param  {any[]} ...values values for configuration of interceptor
 */
export function UseInterceptors(
  ...ids: inversifyInterfaces.ServiceIdentifier<any>[]
) {
  return function(target: any, key?: string) {
    let realTarget = target;
    // if key != undefined then it's a property decorator
    if (key !== undefined) {
      realTarget = target.constructor;
    }
    addInterceptorMetadata(ids, realTarget, key);
  };
}

/**
 * Add interceptors metadata.
 *  If key is undefined, add the list of interceptors for a class (target)
 *  else add the list of interceptors for a method (key) of a class (target)
 *
 * @param  {InterceptorMetadata[]} interceptors
 * @param  {Object} target
 * @param  {string} key?
 */
export function addInterceptorMetadata(
  interceptors: InterceptorMetadata[],
  target: Object,
  key?: string
) {
  let metadataList: InterceptorMetadata[] = [];

  // add key! for disable false error
  // if key is undefined => interceptor metadata for class else for method
  if (!Reflect.hasOwnMetadata(METADATA_KEY.interceptor, target, key!)) {
    Reflect.defineMetadata(
      METADATA_KEY.interceptor,
      metadataList,
      target,
      key!
    );
  } else {
    metadataList = Reflect.getOwnMetadata(
      METADATA_KEY.interceptor,
      target,
      key!
    );
  }

  metadataList.push(...interceptors);
}

export const createInterceptorResolver = (container: Container) =>
  function interceptorResolver(
    interceptor: InterceptorMetadata
  ): AfterResponseInterceptor | Interceptor {
    try {
      // test if the interceptor is a ServiceIdentifier
      return container.get(<inversifyInterfaces.ServiceIdentifier<any>>(
        interceptor
      ));
    } catch (e) {
      return new (<any>interceptor)();
    }
  };

/**
 * Get interceptors metadata.
 * If key is undefined, return the list of interceptors for a class (target)
 *  else return the list of interceptors for a method (key) of a class (target)
 * @param  {Container} container
 * @param  {Object} target
 * @param  {string} key?
 * @returns express.RequestHandler[]
 */
export function getInterceptors(
  container: Container,
  target: Object,
  key?: string
): Interceptors {
  let metadataList: InterceptorMetadata[] = [];
  if (Reflect.hasOwnMetadata(METADATA_KEY.interceptor, target, key!)) {
    metadataList = Reflect.getOwnMetadata(
      METADATA_KEY.interceptor,
      target,
      key!
    );
  }

  const interceptorResolver = createInterceptorResolver(container);

  const interceptors: InterceptorInfo<Interceptor>[] = [];
  const afterResponseInterceptors: InterceptorInfo<
    AfterResponseInterceptor
  >[] = [];

  for (const metadata of metadataList) {
    const interceptor = interceptorResolver(metadata);

    if (isInterceptor(interceptor)) {
      interceptors.push({
        instance: interceptor,
        paramList: getParameterMetadata(interceptor, 'intercept'),
      });
    }

    if (isAfterResponseInterceptor(interceptor)) {
      afterResponseInterceptors.push({
        instance: interceptor,
        paramList: getParameterMetadata(interceptor, 'afterResponse'),
      });
    }
  }

  return {
    interceptors,
    afterResponseInterceptors,
  };
}

export interface InterceptorInfo<T> {
  instance: T;

  paramList: ParameterMetadata[];
}

export interface Interceptors {
  interceptors: InterceptorInfo<Interceptor>[];
  afterResponseInterceptors: InterceptorInfo<AfterResponseInterceptor>[];
}
