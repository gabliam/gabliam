import { reflection } from '@gabliam/core/src';
import {
  All,
  Controller,
  CustomMethod,
  Delete,
  Get,
  Head,
  Patch,
  Post,
  Put,
} from '@gabliam/web-core';

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

      expect(reflection.annotations(TestController)).toMatchSnapshot();
      expect(reflection.propMetadata(TestController)).toMatchSnapshot();
    });
  });

  test('should add method metadata to a class when decorated with @httpMethod', () => {
    const path = 'foo';
    const method = 'get';

    @Controller('/test')
    class TestController {
      @CustomMethod(method, path)
      public test() {
        return;
      }

      @CustomMethod('foo', 'bar')
      public test2() {
        return;
      }

      @CustomMethod('bar', 'foo')
      public test3() {
        return;
      }
    }

    expect(reflection.annotations(TestController)).toMatchSnapshot();
    expect(reflection.propMetadata(TestController)).toMatchSnapshot();
  });
});
