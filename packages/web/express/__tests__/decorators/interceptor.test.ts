import { UseInterceptors } from '@gabliam/web-core';
import { BeanMetadata } from '@gabliam/core';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';

describe('interceptors decorators', () => {
  test('should add Bean metadata to a class when decorated with @UseInterceptors', () => {
    class TestMiddleware {
      @UseInterceptors('test')
      testMethod() {}

      @UseInterceptors('test2')
      test2Method() {}
    }

    const beanMetadata: BeanMetadata[] = Reflect.getMetadata(
      CORE_METADATA_KEY.bean,
      TestMiddleware
    );

    expect(beanMetadata).toMatchSnapshot();
  });
});
