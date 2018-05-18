import { Validate, Controller, Get } from '../../src';
import { METADATA_KEY, ValidateMetadata } from '@gabliam/web-core';

describe('Validate decorator', () => {
  test('should add Validate metadata to a method when decorated with @Validate', () => {
    @Controller('/test')
    class TestController {
      @Get(`/`)
      @Validate({
        body: [5]
      })
      test() {
        return;
      }
    }

    const validateMetadata: ValidateMetadata = Reflect.getMetadata(
      METADATA_KEY.validate,
      TestController,
      'test'
    );

    expect(validateMetadata).toMatchSnapshot();
  });
  test('should add Validate metadata to a method when decorated with @Validate(validatorOptions)', () => {
    @Controller('/test')
    class TestController {
      @Get(`/`)
      @Validate({
        validator: {
          body: [5]
        }
      })
      test() {
        return;
      }
    }

    const validateMetadata: ValidateMetadata = Reflect.getMetadata(
      METADATA_KEY.validate,
      TestController,
      'test'
    );

    expect(validateMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same method with @Validate', () => {
    expect(function() {
      @Controller('/test')
      class TestController {
        @Get(`/`)
        @Validate({
          body: [5]
        })
        @Validate({
          body: [5]
        })
        test() {
          return;
        }
      }
      // tslint:disable-next-line:no-unused-expression
      new TestController();
    }).toThrowError();
  });
});
