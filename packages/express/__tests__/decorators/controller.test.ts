import {
  Controller,
  RestController,
  ControllerMetadata,
  METADATA_KEY,
} from '@gabliam/web-core';
import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';

describe('Controller decorator', () => {
  test('should add Controller metadata to a class when decorated with @Controller(string)', async () => {
    @Controller('/test')
    class TestController {}

    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      METADATA_KEY.controller,
      TestController
    );
    expect(controllerMetadata).toMatchSnapshot();

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      CORE_METADATA_KEY.register,
      TestController
    );

    expect(registryMetadata).toMatchSnapshot();
  });

  test('should add Controller metadata to a class when decorated with @Controller(ControllerOptions)', async () => {
    @Controller({
      name: 'TestControllerName',
      path: '/test',
    })
    class TestController {}

    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      METADATA_KEY.controller,
      TestController
    );

    expect(controllerMetadata).toMatchSnapshot();

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      CORE_METADATA_KEY.register,
      TestController
    );

    expect(registryMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same class with @Controller', () => {
    expect(function() {
      @Controller({
        name: 'TestControllerName',
        path: '/test2',
      })
      @Controller('/test')
      class TestConfig {}
      // tslint:disable-next-line:no-unused-expression
      new TestConfig();
    }).toThrowError();
  });
});

describe('RestController decorator', () => {
  test('should add Controller metadata to a class when decorated with @RestController(string)', async () => {
    @RestController('/test')
    class TestController {}

    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      METADATA_KEY.controller,
      TestController
    );
    expect(controllerMetadata).toMatchSnapshot();

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      CORE_METADATA_KEY.register,
      TestController
    );

    expect(registryMetadata).toMatchSnapshot();
  });

  test('should add Controller metadata to a class when decorated with @RestController(ControllerOptions)', async () => {
    @RestController({
      name: 'TestControllerName',
      path: '/test',
    })
    class TestController {}

    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      METADATA_KEY.controller,
      TestController
    );

    expect(controllerMetadata).toMatchSnapshot();

    const registryMetadata: RegistryMetada = Reflect.getMetadata(
      CORE_METADATA_KEY.register,
      TestController
    );

    expect(registryMetadata).toMatchSnapshot();
  });

  test('should fail when decorated multiple times the same class with @RestController', () => {
    expect(function() {
      @RestController({
        name: 'TestControllerName',
        path: '/test2',
      })
      @RestController('/test')
      class TestConfig {}
      // tslint:disable-next-line:no-unused-expression
      new TestConfig();
    }).toThrowError();
  });
});
