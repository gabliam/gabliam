import { GabliamTest } from '@gabliam/core/src/testing';
import {
  SimpleCacheManager,
  MemoryCache,
  CACHE_MANAGER,
  CachePut,
  CacheEvict,
  CacheGroup,
} from '../../src/index';
import { Bean, Config, Service } from '@gabliam/core';

let g: GabliamTest;
let cache: SimpleCacheManager;
beforeEach(async () => {
  g = new GabliamTest();

  @Config()
  class CacheConfig {
    @Bean(CACHE_MANAGER)
    createCache() {
      cache = new SimpleCacheManager(new Map(), true, MemoryCache);
      return cache;
    }
  }

  g.addClass(CacheConfig);
});

describe('cache evict', () => {
  test('simple cache', async () => {
    @CacheGroup('test')
    @Service()
    class TestService {
      @CachePut('hi')
      async hi(surname: string, name: string) {
        return `hi ${surname} ${name}`;
      }

      @CacheEvict('hi')
      async evicthi(surname: string, name: string) {}
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await cache.getCache('hi', 'test')).toMatchSnapshot();
    expect(await s.evicthi('test', 'test')).toMatchSnapshot();
    expect(await cache.getCache('hi', 'test')).toMatchSnapshot();
  });

  test('cache muliple cachenames', async () => {
    @Service()
    class TestService {
      @CachePut(['hi', 'hi2'])
      async hi(name: string) {
        return `hi ${name}`;
      }

      @CacheEvict(['hi', 'hi2'])
      async evicthi(name: string) {}
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
    expect(await s.evicthi('test2')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
  });

  test('cache muliple cachenames 2', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi', 'hi2'] })
      async hi(name: string) {
        return `hi ${name}`;
      }

      @CacheEvict({ cacheNames: ['hi', 'hi2'] })
      async evicthi(name: string) {}
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await s.hi('test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await cache.getCache('hi2')).toMatchSnapshot();
    expect(await s.evicthi('test2')).toMatchSnapshot();
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

      @CacheEvict({ cacheNames: ['hi', 'hi2'] })
      async hiEvict(user: { name: string }) {}
    }
    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test' })).toMatchSnapshot();
    expect(await s.hi({ name: 'test' })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test' })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache key', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], key: '$args[0].id' })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }

      @CacheEvict({ cacheNames: ['hi'], key: '$args[0].id' })
      async hiEvict(user: { name: string; id: number }) {}
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache condition', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'] })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }

      @CacheEvict({ cacheNames: ['hi'], condition: '$args[0].id !== 1' })
      async hiEvict(user: { name: string; id: number }) {}
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache condition + key', async () => {
    @Service()
    class TestService {
      @CachePut({
        cacheNames: 'hi',
        key: '$args[0].name',
      })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }

      @CacheEvict({
        cacheNames: 'hi',
        condition: '$args[0].id !== 1',
        key: '$args[0].name',
      })
      async hiEvict(user: { name: string; id: number }) {}
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test1', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test2', id: 2 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test3', id: 3 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test3', id: 3 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache unless', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'] })
      async hi(user: { name: string; id: number }) {
        return user.id;
      }

      @CacheEvict({ cacheNames: ['hi'], unless: '$result === 1' })
      async hiEvict(user: { name: string; id: number }) {
        return user.id;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache unless + key', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], key: '$args[0].id' })
      async hi(user: { name: string; id: number }) {
        return user.id;
      }

      @CacheEvict({
        cacheNames: ['hi'],
        key: '$args[0].id',
        unless: '$result === 1',
      })
      async hiEvict(user: { name: string; id: number }) {
        return user.id;
      }
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('cache unless + key + condition', async () => {
    @Service()
    class TestService {
      @CachePut({ cacheNames: ['hi'], key: '$args[0].id' })
      async hi(user: { name: string; id: number }) {
        return user.id;
      }

      @CacheEvict({
        cacheNames: ['hi'],
        key: '$args[0].id',
        unless: '$result === 1',
        condition: '$args[0].id !== 2',
      })
      async hiEvict(user: { name: string; id: number }) {
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
    expect(await s.hiEvict({ name: 'test', id: 1 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 2 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hiEvict({ name: 'test', id: 3 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  test('all entries', async () => {
    @Service()
    class TestService {
      @CachePut({
        cacheNames: 'hi',
        key: '$args[0].name',
      })
      async hi(user: { name: string; id: number }) {
        return `hi ${user.name}`;
      }

      @CacheEvict({
        cacheNames: 'hi',
        allEntries: true,
        beforeInvocation: true,
      })
      async clearAll() {}
    }

    g.addClass(TestService);
    await g.build();

    const s = g.gab.container.get(TestService);
    expect(await s.hi({ name: 'test1', id: 1 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test2', id: 2 })).toMatchSnapshot();
    expect(await s.hi({ name: 'test3', id: 3 })).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.clearAll()).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  describe('errors', () => {
    test('error on condition', async () => {
      @Service()
      class TestService {
        @CacheEvict({ cacheNames: 'hi', condition: 'const test = lol' })
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
        @CacheEvict({ cacheNames: 'hi', key: '{const test = lol}' })
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
