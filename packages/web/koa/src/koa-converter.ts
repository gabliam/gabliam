import {
  Container,
  InjectContainer,
  INJECT_CONTAINER_KEY,
  Service,
  toPromise,
} from '@gabliam/core';
import {
  createInterceptorResolver,
  getContext,
  getExtractArgs,
  isInterceptor,
  BadInterceptorError,
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
      throw new BadInterceptorError(instance);
    }

    const extractArgs = getExtractArgs(instance, 'intercept');

    return async (context: koa.Context, next: () => Promise<any>) => {
      let wasCalled = false;
      const nextWrap = async () => {
        wasCalled = true;
        await next();
      };

      const args = extractArgs(getContext(context.req), null, nextWrap);
      await toPromise((instance['intercept'] as any)(...args));

      if (!wasCalled) {
        await next();
      }
    };
  }
}
