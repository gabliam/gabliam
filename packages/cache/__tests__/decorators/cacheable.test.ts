import { GabliamTest } from '@gabliam/core/lib/testing';
import {
  SimpleCacheManager,
  MemoryCache,
  CACHE_MANAGER,
  Cacheable
} from '../../src/index';
import { Bean, Config, Service } from '@gabliam/core';

let g: GabliamTest;
beforeEach(async () => {
  g = new GabliamTest();

  @Config()
  class CacheConfig {
    @Bean(CACHE_MANAGER)
    createCache() {
      return new SimpleCacheManager(new Map(), true, MemoryCache);
    }
  }

  g.addClass(CacheConfig);
});

describe('cacheable', async () => {
  test('simple cache', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable('hi')
      async hi(surname: string, name: string) {
        call++;
        return `hi ${surname} ${name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(call).toBe(1);
    expect(await s.hi('test2', 'test2')).toMatchSnapshot();
    expect(call).toBe(2);
  });

  test('cache muliple cachenames', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable(['hi', 'hi2'])
      async hi(name: string) {
        call++;
        return `hi ${name}`;
      }

      @Cacheable('hi2')
      async hi2(name: string) {
        return `hi ${name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await s.hi('test')).toMatchSnapshot();
    expect(call).toBe(1);
    expect(await s.hi2('test2')).toMatchSnapshot();
    expect(await s.hi('test2')).toMatchSnapshot();
    expect(call).toBe(1);
  });

  test('cache muliple cachenames', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({ cacheNames: ['hi', 'hi2'] })
      async hi(name: string) {
        call++;
        return `hi ${name}`;
      }

      @Cacheable('hi2')
      async hi2(name: string) {
        return `hi ${name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await s.hi('test')).toMatchSnapshot();
    expect(call).toBe(1);
    expect(await s.hi2('test2')).toMatchSnapshot();
    expect(await s.hi('test2')).toMatchSnapshot();
    expect(call).toBe(1);
  });

  test('cache args object', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({ cacheNames: ['hi', 'hi2'] })
      async hi(user: { name: string }) {
        call++;
        return `hi ${user.name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test' })).toMatchSnapshot();
    expect(await s.hi({ name: 'test' })).toMatchSnapshot();
    expect(call).toBe(1);
  });

  test('cache key', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({ cacheNames: ['hi'], key: '$args[0].id' })
      async hi(user: { name: string; id: number }) {
        call++;
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(call).toBe(2);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(call).toBe(2);
  });

  test('cache condition', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({ cacheNames: ['hi'], condition: '$args[0].id !== 1' })
      async hi(user: { name: string; id: number }) {
        call++;
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(call).toBe(2);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(call).toBe(3);
  });

  test('cache condition + key', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({
        cacheNames: 'hi',
        condition: '$args[0].id !== 1',
        key: '$args[0].name'
      })
      async hi(user: { name: string; id: number }) {
        call++;
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 3 })).toMatchSnapshot();
    expect(call).toBe(2);
    expect(await s.hi({ name: 'test', id: 4 })).toMatchSnapshot();
    expect(call).toBe(2);
  });

  describe('errors', () => {
    test('Throw error when @Cacheable on a sync method', async () => {
      expect(() => {
        @Service()
        class TestService {
          @Cacheable({
            cacheNames: 'hi',
            condition: '$args[0].id !== 1',
            key: '$args[0].name'
          })
          hi(user: { name: string; id: number }) {
            return `hi ${user.name}`;
          }
        }
        // tslint:disable-next-line:no-unused-expression
        new TestService();
      }).toThrowErrorMatchingSnapshot();
    });

    test('error on condition', async () => {
      let call = 0;
      @Service()
      class TestService {
        @Cacheable({ cacheNames: 'hi', condition: 'const test = lol' })
        async hi(surname: string, name: string) {
          call++;
          return `hi ${surname} ${name}`;
        }
      }
      g.addClass(TestService);
      await g.build();

      const s = g.gab.container.get(TestService);
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(call).toBe(2);
      expect(await s.hi('test2', 'test2')).toMatchSnapshot();
      expect(call).toBe(3);
    });

    test('error on key', async () => {
      let call = 0;
      @Service()
      class TestService {
        @Cacheable({ cacheNames: 'hi', key: '{const test = lol}' })
        async hi(surname: string, name: string) {
          call++;
          return `hi ${surname} ${name}`;
        }
      }
      g.addClass(TestService);
      await g.build();

      const s = g.gab.container.get(TestService);
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(call).toBe(2);
      expect(await s.hi('test2', 'test2')).toMatchSnapshot();
      expect(call).toBe(3);
    });
  });
});
