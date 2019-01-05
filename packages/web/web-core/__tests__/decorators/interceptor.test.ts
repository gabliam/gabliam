import { reflection } from '@gabliam/core';
import { UseInterceptors } from '@gabliam/web-core';

describe('interceptors decorators', () => {
  test('should add Bean metadata to a class when decorated with @UseInterceptors', () => {
    class TestMiddleware {
      @UseInterceptors('test')
      testMethod() {}

      @UseInterceptors('test2')
      test2Method() {}
    }

    expect(reflection.propMetadata(TestMiddleware)).toMatchSnapshot();
  });
});
