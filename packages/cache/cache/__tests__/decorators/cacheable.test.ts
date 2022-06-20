/* eslint-disable no-plusplus */
import { Bean, Config, Service } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/src/testing';
import {
  Cacheable,
  CACHE_MANAGER,
  MemoryCache,
  SimpleCacheManager,
} from '../../src/index';

let g: GabliamTest;
beforeEach(async () => {
  g = new GabliamTest();

  @Config()
  class CacheConfig {
    @Bean(CACHE_MANAGER)
    createCache() {
      return new SimpleCacheManager(new Map(), true, MemoryCache, { max: 6 });
    }
  }

  g.addClass(CacheConfig);
});

describe('cacheable', () => {
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
    expect(await s.hi({ name: 'test2', id: 2 })).toMatchSnapshot();
    expect(call).toBe(2);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test2', id: 2 })).toMatchSnapshot();
    expect(call).toBe(3);
  });

  test('cache condition + key', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({
        cacheNames: 'hi',
        condition: '$args[0].id !== 1',
        key: '$args[0].name',
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

  test('cache unless', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({ cacheNames: ['hi'], unless: '$result === 16' })
      async nextYear(user: { name: string; id: number; age: number }) {
        call++;
        return user.age + 1;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(
      await s.nextYear({ name: 'test', id: 1, age: 15 }),
    ).toMatchSnapshot();
    expect(
      await s.nextYear({ name: 'test2', id: 2, age: 18 }),
    ).toMatchSnapshot();
    expect(call).toBe(2);
    expect(
      await s.nextYear({ name: 'test', id: 1, age: 15 }),
    ).toMatchSnapshot();
    expect(
      await s.nextYear({ name: 'test2', id: 2, age: 18 }),
    ).toMatchSnapshot();
    expect(call).toBe(3);
  });

  test('cache unless 2', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({
        cacheNames: ['hi'],
        unless: 'Array.isArray($result) && $result.length === 0',
      })
      async nextYear(user: { name: string; id: number; age: number }) {
        call++;
        if (user.age === 15) {
          return [];
        }

        return user.age + 1;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(
      await s.nextYear({ name: 'test', id: 1, age: 15 }),
    ).toMatchSnapshot();
    expect(
      await s.nextYear({ name: 'test2', id: 2, age: 18 }),
    ).toMatchSnapshot();
    expect(call).toBe(2);
    expect(
      await s.nextYear({ name: 'test', id: 1, age: 15 }),
    ).toMatchSnapshot();
    expect(
      await s.nextYear({ name: 'test2', id: 2, age: 18 }),
    ).toMatchSnapshot();
    expect(call).toBe(3);
  });

  test('cache unless + key', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({
        cacheNames: 'hi',
        unless: '$result === 1',
        key: '$args[0].name',
      })
      async hi(user: { name: string; id: number }) {
        call++;
        return user.id;
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

  test('cache unless + key + condition', async () => {
    let call = 0;

    @Service()
    class TestService {
      @Cacheable({
        cacheNames: 'hi',
        condition: '$args[0].id !== 1',
        unless: '$result === 2',
        key: '$args[0].name',
      })
      async hi(user: { name: string; id: number }) {
        call++;
        return user.id;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 3 })).toMatchSnapshot();
    expect(call).toBe(3);
    expect(await s.hi({ name: 'test', id: 4 })).toMatchSnapshot();
    expect(call).toBe(3);
  });

  describe('errors', () => {
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
