import { Middleware, MiddlewareInject } from '../../src/decorators';
import { BeanMetadata } from '@gabliam/core/lib/interfaces';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';
import { MiddlewareMetadata } from '../../src/interfaces';
import { METADATA_KEY } from '../../src/constants';

describe('middleware decorators', () => {
  test('should add Bean metadata to a class when decorated with @Middleware', () => {
    class TestMiddleware {
      @Middleware('test')
      testMethod() {}

      @Middleware('test2')
      test2Method() {}
    }

    const beanMetadata: BeanMetadata[] = Reflect.getMetadata(
      CORE_METADATA_KEY.bean,
      TestMiddleware
    );

    expect(beanMetadata).toMatchSnapshot();
  });

  test('should add Middleware metadata to a class when decorated with @MiddlewareInject', () => {
    @MiddlewareInject('log')
    class TestMiddleware {
      @MiddlewareInject('auth', 'isAdmin')
      testMethod() {}

      @MiddlewareInject('auth', 'foo', 'bar', 12)
      test2Method() {}
    }

    const middlewareMetadata: MiddlewareMetadata[] = Reflect.getOwnMetadata(
      METADATA_KEY.middleware,
      TestMiddleware
    );

    expect(middlewareMetadata).toMatchSnapshot();

    ['testMethod', 'test2Method'].forEach(m => {
      const middlewareMetadataMethod: MiddlewareMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.middleware,
        TestMiddleware,
        m
      );

      expect(middlewareMetadataMethod).toMatchSnapshot();
    });
  });
});
