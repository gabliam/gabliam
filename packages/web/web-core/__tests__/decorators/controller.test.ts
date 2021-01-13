import { reflection } from '@gabliam/core';
import { Controller, RestController } from '@gabliam/web-core';

describe('Controller decorator', () => {
  test('should add Controller metadata to a class when decorated with @Controller(string)', async () => {
    @Controller('/test')
    class TestController {}

    expect(reflection.annotations(TestController)).toMatchSnapshot();
  });

  test('should add Controller metadata to a class when decorated with @Controller(ControllerOptions)', async () => {
    @Controller({
      name: 'TestControllerName',
      path: '/test',
    })
    class TestController {}

    expect(reflection.annotations(TestController)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same class with @Controller', () => {
    expect(function() {
      @Controller({
        name: 'TestControllerName',
        path: '/test2',
      })
      @Controller('/test')
      class TestConfig {}
      new TestConfig();
    }).toThrowError();
  });
});

describe('RestController decorator', () => {
  test('should add Controller metadata to a class when decorated with @RestController(string)', async () => {
    @RestController('/test')
    class TestController {}

    expect(reflection.annotations(TestController)).toMatchSnapshot();
  });

  test('should add Controller metadata to a class when decorated with @RestController(ControllerOptions)', async () => {
    @RestController({
      name: 'TestControllerName',
      path: '/test',
    })
    class TestController {}

    expect(reflection.annotations(TestController)).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same class with @RestController', () => {
    expect(function() {
      @RestController({
        name: 'TestControllerName',
        path: '/test2',
      })
      @RestController('/test')
      class TestConfig {}
      new TestConfig();
    }).toThrowError();
  });
});
