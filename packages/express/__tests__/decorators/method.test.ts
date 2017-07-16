import { Controller } from '../../src/decorators';
import * as methods from '../../src/decorators/method';
import {
  ControllerMetadata,
  ControllerMethodMetadata,
  MiddlewareMetadata
} from '../../src/interfaces';
import { METADATA_KEY } from '../../src/constants';
import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';

describe('Methods decorators', () => {
  [
    {
      name: 'All',
      dec: methods.All
    },
    {
      name: 'Get',
      dec: methods.Get
    },
    {
      name: 'Post',
      dec: methods.Post
    },
    {
      name: 'Put',
      dec: methods.Put
    },
    {
      name: 'Patch',
      dec: methods.Patch
    },
    {
      name: 'Head',
      dec: methods.Head
    },
    {
      name: 'Delete',
      dec: methods.Delete
    }
  ].forEach(m => {
    test(`should add Methods metadata to a class when decorated with @${m.name}`, async () => {
      const middlewares = [
        function() {
          return;
        }
      ];
      @Controller('/test')
      class TestController {
        @m.dec(`/${m.name}`)
        test() {
          return;
        }

        @m.dec(`/${m.name}2`, ...middlewares)
        test2() {
          return;
        }
      }

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

      const controllerMethodMetadata: ControllerMethodMetadata[] = Reflect.getMetadata(
        METADATA_KEY.controllerMethod,
        TestController
      );

      expect(controllerMethodMetadata).toMatchSnapshot();

      const middlewareMetadata: MiddlewareMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.middleware,
        TestController,
        'test2'
      );

      expect(middlewareMetadata).toMatchSnapshot();
    });
  });

  test('should add method metadata to a class when decorated with @httpMethod', () => {
    const middleware = [
      function() {
        return;
      }
    ];
    const path = 'foo';
    const method = 'get';

    @Controller('/test')
    class TestController {
      @methods.Method(method, path, ...middleware)
      public test() {
        return;
      }

      @methods.Method('foo', 'bar')
      public test2() {
        return;
      }

      @methods.Method('bar', 'foo')
      public test3() {
        return;
      }
    }

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

    const controllerMethodMetadata: ControllerMethodMetadata[] = Reflect.getMetadata(
      METADATA_KEY.controllerMethod,
      TestController
    );

    expect(controllerMethodMetadata).toMatchSnapshot();

    const middlewareMetadata: MiddlewareMetadata[] = Reflect.getOwnMetadata(
      METADATA_KEY.middleware,
      TestController,
      'test'
    );

    expect(middlewareMetadata).toMatchSnapshot();
  });
});
