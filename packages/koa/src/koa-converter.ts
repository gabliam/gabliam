import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  Service,
  toPromise,
} from '@gabliam/core';
import {
  createInterceptorResolver,
  extractParameters,
  getParameterMetadata,
  isInterceptor,
  getContext,
} from '@gabliam/web-core';
import { koa } from './koa';

/**
 * Class for convert interceptor to Koa Middleware
 */
@InjectContainer()
@Service()
export class KoaConverter {
  public interceptorToMiddleware(clazz: any): koa.Middleware {
    const container = <Container>(this as any)[INJECT_CONTAINER_KEY];
    const instance = createInterceptorResolver(container)(clazz);
    if (!isInterceptor(instance)) {
      throw new Error();
    }

    return async (context: koa.Context, next: () => Promise<any>) => {
      const args = extractParameters(
        instance,
        'intercept',
        null,
        getContext(context.req),
        next,
        getParameterMetadata(instance, 'intercept')
      );
      await toPromise((instance['intercept'] as any)(...args));
      await next();
    };
  }
}
