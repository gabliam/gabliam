import {
  Container,
  gabliamValue,
  inversifyInterfaces,
  reflection,
} from '@gabliam/core';
import { extractArgsFn } from './interface';
import { UseInterceptors } from './metadatas';
import { getExtractArgs } from './utils';

/**
 * InterceptorConstructor
 */
export type InterceptorConstructor = new () => Interceptor;

/**
 * Interceptor
 */
export interface Interceptor {
  intercept(...args: any[]): gabliamValue<any>;
}

export function isInterceptor(value: any): value is Interceptor {
  return value && typeof value.intercept === 'function';
}

export const createInterceptorResolver = (container: Container) =>
  function interceptorResolver(interceptor: any): Interceptor {
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
  target: any,
  key?: string
): InterceptorInfo[] {
  let metadataList: inversifyInterfaces.ServiceIdentifier<any>[] = [];
  let metas: UseInterceptors[];
  if (!key) {
    metas =
      reflection.annotationsOfDecorator<UseInterceptors>(
        target,
        UseInterceptors
      ) || [];
  } else {
    metas =
      reflection.propMetadataOfDecorator<UseInterceptors>(
        target,
        UseInterceptors
      )[key] || [];
  }

  metadataList = metas.reduce((prev, current) => {
    prev.push(...current.ids);
    return prev;
  }, metadataList);

  const interceptorResolver = createInterceptorResolver(container);

  const interceptors: InterceptorInfo[] = [];

  for (const metadata of metadataList) {
    const interceptor = interceptorResolver(metadata);

    if (isInterceptor(interceptor)) {
      interceptors.push({
        instance: interceptor,
        extractArgs: getExtractArgs(interceptor, 'intercept'),
      });
    }
  }

  return interceptors;
}

export interface InterceptorInfo {
  instance: Interceptor;

  extractArgs: extractArgsFn;
}
