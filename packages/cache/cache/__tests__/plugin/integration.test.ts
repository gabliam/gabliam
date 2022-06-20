import { Service } from '@gabliam/core';
import {
  CacheManager,
  CachePut,
  CACHE_MANAGER,
  NoOpCache,
  SimpleCacheManager,
} from '../../src/index';
import { CachePluginTest } from './cache-plugin-test';

let appTest: CachePluginTest;

beforeEach(async () => {
  appTest = new CachePluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('config test', () => {
  it('without config', async () => {
    await appTest.build();
    const cacheManager = appTest.gab.container.get<CacheManager>(CACHE_MANAGER);
    expect(cacheManager).toMatchSnapshot();
  });

  it('with config', async () => {
    appTest.addConf('application.cacheConfig', {
      defaultCache: 'MemoryCache',
      defaultOptionsCache: {
        max: 1,
      },
    });
    await appTest.build();
    const cacheManager = appTest.gab.container.get<CacheManager>(CACHE_MANAGER);
    expect(cacheManager).toMatchSnapshot();
  });

  describe('bad config', () => {
    it('bad defaultCache', async () => {
      appTest.addConf('application.cacheConfig', {
        defaultCache: 'BadCache',
      });
      await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
    });

    it('bad cacheManager', async () => {
      appTest.addConf('application.cacheConfig', {
        cacheManager: 'BadCacheManager',
      });
      await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
    });
  });
});

describe('integrations', () => {
  it('test cache', async () => {
    @Service()
    class TestService {
      @CachePut('hi')
      async hi(surname: string, name: string) {
        return `hi ${surname} ${name}`;
      }
    }
    appTest.addClass(TestService);
    appTest.addConf('application.cacheConfig', {
      defaultCache: 'MemoryCache',
      defaultOptionsCache: {
        max: 5,
      },
    });
    await appTest.build();
    const s = appTest.gab.container.get(TestService);
    const cache = appTest.gab.container.get<CacheManager>(CACHE_MANAGER);
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi('test2', 'test2')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });

  it('with mapCache', async () => {
    class CustomCacheManager extends SimpleCacheManager {}

    @Service()
    class TestService {
      @CachePut('hi')
      async hi(surname: string, name: string) {
        return `hi ${surname} ${name}`;
      }
    }
    appTest.addClass(TestService);
    appTest.addConf('application.cacheConfig', {
      cacheManager: CustomCacheManager,
      groups: {
        default: {
          caches: {
            test: {
              cache: 'MemoryCache',
              options: {
                max: 5,
              },
            },
            test2: {
              cache: NoOpCache,
            },
          },
        },
      },
    });
    await appTest.build();
    const s = appTest.gab.container.get(TestService);
    const cache = appTest.gab.container.get<CacheManager>(CACHE_MANAGER);
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await s.hi('test', 'test')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
    expect(await s.hi('test2', 'test2')).toMatchSnapshot();
    expect(await cache.getCache('hi')).toMatchSnapshot();
  });
});
