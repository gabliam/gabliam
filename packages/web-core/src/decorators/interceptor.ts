import { Container, inversifyInterfaces, gabliamValue } from '@gabliam/core';
import { METADATA_KEY } from '../constants';

export type InterceptorMetadata = inversifyInterfaces.ServiceIdentifier<any>;

/**
 * Interceptor
 */
export interface Interceptor {
  intercept(): gabliamValue<void>;
  intercept<T1>(a1: T1): gabliamValue<void>;
  intercept<T1, T2>(a1: T1, a2: T2): gabliamValue<void>;
  intercept<T1, T2, T3>(a1: T1, a2: T2, a3: T3): gabliamValue<void>;
  intercept<T1, T2, T3, T4>(a1: T1, a2: T2, a3: T3, a4: T4): gabliamValue<void>;
  intercept<T1, T2, T3, T4, T5>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5
  ): gabliamValue<void>;
  intercept<T1, T2, T3, T4, T5, T6>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6
  ): gabliamValue<void>;
  intercept<T1, T2, T3, T4, T5, T6, T7>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6,
    a7: T7
  ): gabliamValue<void>;
  intercept<T1, T2, T3, T4, T5, T6, T7, T8>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6,
    a7: T7,
    a8: T8
  ): gabliamValue<void>;
  intercept<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6,
    a7: T7,
    a8: T8,
    a9: T9
  ): gabliamValue<void>;

  afterResponse(): gabliamValue<void>;
  afterResponse<T1>(a1: T1): gabliamValue<void>;
  afterResponse<T1, T2>(a1: T1, a2: T2): gabliamValue<void>;
  afterResponse<T1, T2, T3>(a1: T1, a2: T2, a3: T3): gabliamValue<void>;
  afterResponse<T1, T2, T3, T4>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4
  ): gabliamValue<void>;
  afterResponse<T1, T2, T3, T4, T5>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5
  ): gabliamValue<void>;
  afterResponse<T1, T2, T3, T4, T5, T6>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6
  ): gabliamValue<void>;
  afterResponse<T1, T2, T3, T4, T5, T6, T7>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6,
    a7: T7
  ): gabliamValue<void>;
  afterResponse<T1, T2, T3, T4, T5, T6, T7, T8>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6,
    a7: T7,
    a8: T8
  ): gabliamValue<void>;
  afterResponse<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    a1: T1,
    a2: T2,
    a3: T3,
    a4: T4,
    a5: T5,
    a6: T6,
    a7: T7,
    a8: T8,
    a9: T9
  ): gabliamValue<void>;
}

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
): Interceptor[] {
  let metadataList: InterceptorMetadata[] = [];
  if (Reflect.hasOwnMetadata(METADATA_KEY.interceptor, target, key!)) {
    metadataList = Reflect.getOwnMetadata(
      METADATA_KEY.interceptor,
      target,
      key!
    );
  }

  /**
   * resolve a interceptor
   * @param interceptor
   */
  function resolveInterceptor(interceptor: InterceptorMetadata): Interceptor {
    try {
      // test if the interceptor is a ServiceIdentifier
      return container.get<Interceptor>(<
        inversifyInterfaces.ServiceIdentifier<any>
      >interceptor);
    } catch (e) {
      return <Interceptor>(<any>interceptor);
    }
  }

  return metadataList.reduce<Interceptor[]>((prev, metadata) => {
    prev.push(resolveInterceptor(metadata));
    return prev;
  }, []);
}
