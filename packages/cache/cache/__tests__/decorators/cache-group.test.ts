// tslint:disable:no-unused-expression
import { GabliamTest } from '@gabliam/core/lib/testing';
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

describe('cache group', async () => {
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
});

test('should fail when decorated multiple times with @CacheGroup', () => {
  expect(function() {
    @CacheGroup('test')
    @CacheGroup('test2')
    class TestBean {}

    new TestBean();
  }).toThrowError();
});

test('should fail when cachename is missing', async () => {
  expect(function() {
    @CacheGroup('test')
    class TestBean {
      @CachePut()
      async hi(surname: string, name: string) {
        return `hi ${surname} ${name}`;
      }
    }

    new TestBean();
  }).toThrowError();
});
