import { reflection } from '@gabliam/core';
import { UsePipes } from '../..';

describe('transformer decorators', () => {
  test('should add Bean metadata to a prop when decorated with @UseTransformers', () => {
    class TestMiddleware {
      @UsePipes('test')
      testMethod() {}

      @UsePipes('test2')
      test2Method() {}
    }

    expect(reflection.propMetadata(TestMiddleware)).toMatchSnapshot();
  });

  test('should add Bean metadata to a class when decorated with @UseTransformers', () => {
    @UsePipes('test')
    class TestMiddleware {}

    expect(reflection.annotations(TestMiddleware)).toMatchSnapshot();
  });

  test('should add Bean metadata to a param when decorated with @UseTransformers', () => {
    class TestMiddleware {
      testMethod(
        testBefore: string,
        @UsePipes('test') test: string,
        testAfter: string,
      ) {}
    }

    expect(
      reflection.parameters(TestMiddleware, 'testMethod'),
    ).toMatchSnapshot();
  });

  test('should add Bean metadata to class, prop and param when decorated with @UseTransformers', () => {
    @UsePipes('testClass')
    class TestMiddleware {
      @UsePipes('testMethod')
      testMethod(@UsePipes('testParam') test: string) {}
    }
    expect(reflection.annotations(TestMiddleware)).toMatchSnapshot();
    expect(reflection.propMetadata(TestMiddleware)).toMatchSnapshot();
    expect(
      reflection.parameters(TestMiddleware, 'testMethod'),
    ).toMatchSnapshot();
  });
});
