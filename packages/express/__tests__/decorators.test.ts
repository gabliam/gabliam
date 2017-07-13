import { ExpressConfig, ExpressErrorConfig } from '../src/decorators';
import { ExpressConfigMetadata } from '../src/interfaces';
import { METADATA_KEY } from '../src/constants';

describe('ExpressConfig decorator', () => {
  test('should add ExpressConfig metadata to a class when decorated with @ExpressConfig', () => {
    class TestConfig {
      @ExpressConfig()
      testMethod() {}

      @ExpressConfig()
      test2Method() {}
    }

    const expressConfigMetadata: ExpressConfigMetadata[] = Reflect.getMetadata(
      METADATA_KEY.MiddlewareConfig,
      TestConfig
    );

    expect(expressConfigMetadata).toMatchSnapshot();
  });

  test('should add ExpressConfig metadata to a class when decorated with @ExpressConfig(order)', () => {
    class TestConfig {
      @ExpressConfig(50)
      testMethod() {}

      @ExpressConfig(100)
      test2Method() {}
    }

    const expressConfigMetadata: ExpressConfigMetadata[] = Reflect.getMetadata(
      METADATA_KEY.MiddlewareConfig,
      TestConfig
    );

    expect(expressConfigMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same method with @ExpressConfig', () => {
    expect(function() {
      class TestConfig {
        @ExpressConfig()
        @ExpressConfig(50)
        testMethod() {}

        @ExpressConfig(100)
        test2Method() {}
      }
      // tslint:disable-next-line:no-unused-expression
      new TestConfig();
    }).toThrowError();
  });
});

describe('ExpressErrorConfig decorator', () => {
  test('should add ExpressErrorConfig metadata to a class when decorated with @ExpressErrorConfig', () => {
    class TestConfig {
      @ExpressErrorConfig()
      testMethod() {}

      @ExpressErrorConfig()
      test2Method() {}
    }

    const expressErrorConfigMetadata: ExpressConfigMetadata[] = Reflect.getMetadata(
      METADATA_KEY.MiddlewareErrorConfig,
      TestConfig
    );

    expect(expressErrorConfigMetadata).toMatchSnapshot();
  });

  test('should add ExpressErrorConfig metadata to a class when decorated with @ExpressErrorConfig(order)', () => {
    class TestConfig {
      @ExpressErrorConfig(50)
      testMethod() {}

      @ExpressErrorConfig(100)
      test2Method() {}
    }

    const expressErrorConfigMetadata: ExpressConfigMetadata[] = Reflect.getMetadata(
      METADATA_KEY.MiddlewareErrorConfig,
      TestConfig
    );

    expect(expressErrorConfigMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same method with @ExpressErrorConfig', () => {
    expect(function() {
      class TestConfig {
        @ExpressErrorConfig()
        @ExpressErrorConfig(50)
        testMethod() {}

        @ExpressErrorConfig(100)
        test2Method() {}
      }
      // tslint:disable-next-line:no-unused-expression
      new TestConfig();
    }).toThrowError();
  });
});
