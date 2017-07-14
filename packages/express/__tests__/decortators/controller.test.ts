import { Controller, RestController } from '../../src/decorators';
import { ControllerMetadata } from '../../src/interfaces';
import { METADATA_KEY } from '../../src/constants';
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
    const middlewares = [
      function() {
        return;
      }
    ];
    @Controller({
      name: 'TestControllerName',
      path: '/test',
      middlewares
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
      const middlewares = [
        function() {
          return;
        }
      ];
      @Controller({
        name: 'TestControllerName',
        path: '/test2',
        middlewares
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
    const middlewares = [
      function() {
        return;
      }
    ];
    @RestController({
      name: 'TestControllerName',
      path: '/test',
      middlewares
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
      const middlewares = [
        function() {
          return;
        }
      ];
      @RestController({
        name: 'TestControllerName',
        path: '/test2',
        middlewares
      })
      @RestController('/test')
      class TestConfig {}
      // tslint:disable-next-line:no-unused-expression
      new TestConfig();
    }).toThrowError();
  });
});
