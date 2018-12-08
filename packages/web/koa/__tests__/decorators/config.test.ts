import { WebConfigMetadata, METADATA_KEY, WebConfig } from '@gabliam/web-core';

describe('WebConfig decorator', () => {
  test('should add WebConfig metadata to a class when decorated with @WebConfig', () => {
    class TestConfig {
      @WebConfig()
      testMethod() {}

      @WebConfig()
      test2Method() {}
    }

    const webConfigMetadata: WebConfigMetadata[] = Reflect.getMetadata(
      METADATA_KEY.webConfig,
      TestConfig
    );

    expect(webConfigMetadata).toMatchSnapshot();
  });

  test('should add WebConfig metadata to a class when decorated with @WebConfig(order)', () => {
    class TestConfig {
      @WebConfig(50)
      testMethod() {}

      @WebConfig(100)
      test2Method() {}
    }

    const webConfigMetadata: WebConfigMetadata[] = Reflect.getMetadata(
      METADATA_KEY.webConfig,
      TestConfig
    );

    expect(webConfigMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same method with @WebConfig', () => {
    expect(function() {
      class TestConfig {
        @WebConfig()
        @WebConfig(50)
        testMethod() {}

        @WebConfig(100)
        test2Method() {}
      }
      // tslint:disable-next-line:no-unused-expression
      new TestConfig();
    }).toThrowError();
  });
});
