import {
  Container,
  gabliamValue,
  inversifyInterfaces,
  reflection,
} from '@gabliam/core';
import { extractArgsFn } from './interface';
import { UseInterceptors } from './metadatas';
import { getExtractArgs } from './utils';
import { WebConfiguration } from './web-configuration';
import { BadInterceptorError } from './errors';

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
    if (isInterceptor(interceptor)) {
      return interceptor;
    }

    try {
      // test if the interceptor is a ServiceIdentifier
      return container.get(interceptor);
    } catch {
      try {
        // test if interceptor is constructable
        // tslint:disable-next-line:no-unused-expression
        const t = new (<any>interceptor)();

        if (!isInterceptor(t)) {
          throw new BadInterceptorError(t);
        }

        container
          .bind(interceptor)
          .to(interceptor)
          .inSingletonScope();
        return container.get(interceptor);
      } catch (e) {
        if (e instanceof BadInterceptorError) {
          throw e;
        } else {
          throw new BadInterceptorError(interceptor);
        }
      }
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
export function extractInterceptors(
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

export const getGlobalInterceptors = (container: Container) => {
  const webConfiguration = container.get(WebConfiguration);
  const interceptors: InterceptorInfo[] = [];
  const interceptorResolver = createInterceptorResolver(container);

  for (const interceptorId of webConfiguration.globalInterceptors) {
    const interceptor = interceptorResolver(interceptorId);

    if (isInterceptor(interceptor)) {
      interceptors.push({
        instance: interceptor,
        extractArgs: getExtractArgs(interceptor, 'intercept'),
      });
    }
  }

  return interceptors;
};

export interface InterceptorInfo {
  instance: Interceptor;

  extractArgs: extractArgsFn;
}
