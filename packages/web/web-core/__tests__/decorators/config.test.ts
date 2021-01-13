import { reflection } from '@gabliam/core';
import { WebConfig, WebConfigAfterControllers } from '@gabliam/web-core';

describe('WebConfig decorator', () => {
  test('should add WebConfig metadata to a class when decorated with @WebConfig', () => {
    class TestConfig {
      @WebConfig()
      testMethod() {}

      @WebConfig()
      test2Method() {}
    }

    expect(reflection.propMetadata(TestConfig)).toMatchSnapshot();
  });

  test('should add WebConfig metadata to a class when decorated with @WebConfig(order)', () => {
    class TestConfig {
      @WebConfig(50)
      testMethod() {}

      @WebConfig(100)
      test2Method() {}
    }

    expect(reflection.propMetadata(TestConfig)).toMatchSnapshot();
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
      new TestConfig();
    }).toThrowError();
  });
});

describe('WebConfigAfterControllers decorator', () => {
  test('should add WebConfigAfterControllers metadata to a class when decorated with @WebConfigAfterControllers', () => {
    class TestConfig {
      @WebConfigAfterControllers()
      testMethod() {}

      @WebConfigAfterControllers()
      test2Method() {}
    }

    expect(reflection.propMetadata(TestConfig)).toMatchSnapshot();
  });

  test('should add WebConfigAfterControllers metadata to a class when decorated with @WebConfigAfterControllers(order)', () => {
    class TestConfig {
      @WebConfigAfterControllers(50)
      testMethod() {}

      @WebConfigAfterControllers(100)
      test2Method() {}
    }

    expect(reflection.propMetadata(TestConfig)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same method with @WebConfigAfterControllers', () => {
    expect(function() {
      class TestConfig {
        @WebConfigAfterControllers()
        @WebConfigAfterControllers(50)
        testMethod() {}

        @WebConfigAfterControllers(100)
        test2Method() {}
      }
      new TestConfig();
    }).toThrowError();
  });
});
