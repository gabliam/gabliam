import {
  ControllerMetadata,
  ControllerMethodMetadata,
  Controller,
  METADATA_KEY,
  All,
  Get,
  Post,
  Put,
  Patch,
  Head,
  Delete,
  Method,
} from '@gabliam/web-core';
import { RegistryMetada } from '@gabliam/core';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';

describe('Methods decorators', () => {
  [
    {
      name: 'All',
      dec: All,
    },
    {
      name: 'Get',
      dec: Get,
    },
    {
      name: 'Post',
      dec: Post,
    },
    {
      name: 'Put',
      dec: Put,
    },
    {
      name: 'Patch',
      dec: Patch,
    },
    {
      name: 'Head',
      dec: Head,
    },
    {
      name: 'Delete',
      dec: Delete,
    },
  ].forEach(m => {
    test(`should add Methods metadata to a class when decorated with @${
      m.name
    }`, async () => {
      @Controller('/test')
      class TestController {
        @m.dec(`/${m.name}`)
        test() {
          return;
        }

        @m.dec(`/${m.name}2`)
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
    });
  });

  test('should add method metadata to a class when decorated with @httpMethod', () => {
    const path = 'foo';
    const method = 'get';

    @Controller('/test')
    class TestController {
      @Method(method, path)
      public test() {
        return;
      }

      @Method('foo', 'bar')
      public test2() {
        return;
      }

      @Method('bar', 'foo')
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
  });
});
