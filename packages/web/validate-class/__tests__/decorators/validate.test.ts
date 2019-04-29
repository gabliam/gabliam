import { reflection } from '@gabliam/core';
import { Controller, Get } from '@gabliam/web-core';
import { Validate } from '../../src';

describe('Validate decorator', () => {
  test('should add Validate metadata to a method when decorated with @Validate', () => {
    @Controller('/test')
    class TestController {
      @Get(`/`)
      @Validate()
      test() {
        return '';
      }
    }

    expect(reflection.propMetadata(TestController)).toMatchSnapshot();
  });
  test('should add Validate metadata to a method when decorated with @Validate(validatorOptions)', () => {
    @Controller('/test')
    class TestController {
      @Get(`/`)
      @Validate({
        transform: true,
      })
      test() {
        return;
      }
    }

    expect(reflection.propMetadata(TestController)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same method with @Validate', () => {
    expect(function() {
      @Controller('/test')
      class TestController {
        @Get(`/`)
        @Validate()
        @Validate()
        test() {
          return;
        }
      }
      // tslint:disable-next-line:no-unused-expression
      new TestController();
    }).toThrowError();
  });
});
