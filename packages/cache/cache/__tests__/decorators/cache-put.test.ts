import { Bean, Config, Service } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/src/testing';
import {
  CachePut,
  CACHE_MANAGER,
  MemoryCache,
  SimpleCacheManager,
} from '../../src/index';

let g: GabliamTest;
let cache: SimpleCacheManager;
beforeEach(async () => {
  g = new GabliamTest();

  @Config()
  class CacheConfig {
    @Bean(CACHE_MANAGER)
    createCache() {
      cache = new SimpleCacheManager(new Map(), true, MemoryCache, { max: 3 });
      return cache;
    }
  }

  g.addClass(CacheConfig);
});

describe('cache put', () => {
  test('simple cache', async () => {
    @Service()
    class TestService {
      @CachePut('hi')
      async hi(surname: string, name: string) {
        return `hi ${surname} ${name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi('test2', 'test2')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache muliple cachenames', async () => {
    @Service()
    class TestService {
      @CachePut(['hi', 'hi2'])
      async hi(name: string) {
        return `hi ${name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
    expect(await s.hi('test2')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
  });

  test('cache muliple cachenames', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi', 'hi2'] })
      async hi(name: string) {
        return `hi ${name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
    expect(await s.hi('test2')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
  });

  test('cache args object', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi', 'hi2'] })
      async hi(user: { name: string }) {
        return `hi ${user.name}`;
      }
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test' })).toMatchSnapshot();
    expect(await s.hi({ name: 'test' })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache key', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], key: '$args[0].id' })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache key array', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], key: '[$args[0].id]' })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache condition', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], condition: '$args[0].id !== 1' })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache condition + key', async () => {
    @Service()
    class TestService {
      @CachePut({
        cacheNames: 'hi',
        condition: '$args[0].id !== 1',
        key: '$args[0].name',
      })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 3 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 4 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache unless', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], unless: '$result === 1' })
      async hi(user: { name: string; id: number }) {
        return user.id;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache unless + key', async () => {
    @Service()
    class TestService {
      @CachePut({
        cacheNames: ['hi'],
        unless: '$result === 1',
        key: '$args[0].id',
      })
      async hi(user: { name: string; id: number }) {
        return user.id;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache unless + key + condition', async () => {
    @Service()
    class TestService {
      @CachePut({
        cacheNames: ['hi'],
        unless: '$result === 1',
        key: '$args[0].id',
        condition: '$args[0].id !== 2',
      })
      async hi(user: { name: string; id: number }) {
        return user.id;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 3 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  describe('errors', () => {
    test('error on condition', async () => {
      @Service()
      class TestService {
        @CachePut({ cacheNames: 'hi', condition: 'const test = lol' })
        async hi(surname: string, name: string) {
          return `hi ${surname} ${name}`;
        }
      }
      g.addClass(TestService);
      await g.build();

      const s = g.gab.container.get(TestService);
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(await cache.getCache('hi')).toMatchSnapshot();
      expect(await s.hi('test2', 'test2')).toMatchSnapshot();
      expect(await cache.getCache('hi')).toMatchSnapshot();
    });

    test('error on key', async () => {
      @Service()
      class TestService {
        @CachePut({ cacheNames: 'hi', key: '{const test = lol}' })
        async hi(surname: string, name: string) {
          return `hi ${surname} ${name}`;
        }
      }
      g.addClass(TestService);
      await g.build();

      const s = g.gab.container.get(TestService);
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(await s.hi('test', 'test')).toMatchSnapshot();
      expect(await cache.getCache('hi')).toMatchSnapshot();
      expect(await s.hi('test2', 'test2')).toMatchSnapshot();
      expect(await cache.getCache('hi')).toMatchSnapshot();
    });
  });
});
