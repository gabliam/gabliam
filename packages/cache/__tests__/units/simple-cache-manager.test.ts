import { SimpleCacheManager, NoOpCache } from '../../src/index';

describe('SimpleCacheManager without dynamic', () => {
  const cache = new NoOpCache('test');
  const cacheManager = new SimpleCacheManager(
    new Map().set('test', cache),
    false
  );
  test('must return cache', () => {
    expect(cacheManager.getCache('test')).toMatchSnapshot();
    expect(cacheManager.getCacheNames()).toMatchSnapshot();
  });
  test('must return undefined', () => {
    expect(cacheManager.getCache('test2')).toMatchSnapshot();
    expect(cacheManager.getCacheNames()).toMatchSnapshot();
  });
});

describe('SimpleCacheManager with dynamic and whitout defaultCache', () => {
  const cache = new NoOpCache('test');
  const cacheManager = new SimpleCacheManager(
    new Map().set('test', cache),
    true
  );
  test('must return cache', () => {
    expect(cacheManager.getCache('test')).toMatchSnapshot();
    expect(cacheManager.getCacheNames()).toMatchSnapshot();
  });
  test('must create and return cache', () => {
    expect(cacheManager.getCache('test2')).toMatchSnapshot();
    expect(cacheManager.getCacheNames()).toMatchSnapshot();
  });
});

describe('SimpleCacheManager with dynamic and defaultCache', () => {
  class NoOpCache2 extends NoOpCache {
    // @ts-ignore
    constructor(name: string, private options?: object) {
      super(name);
    }
  }
  const cache = new NoOpCache('test');
  const cacheManager = new SimpleCacheManager(
    new Map().set('test', cache),
    true,
    NoOpCache2,
    { options: 'any' }
  );
  test('must return cache', () => {
    expect(cacheManager.getCache('test')).toMatchSnapshot();
    expect(cacheManager.getCacheNames()).toMatchSnapshot();
  });
  test('must create and return cache', () => {
    expect(cacheManager.getCache('test2')).toMatchSnapshot();
    expect(cacheManager.getCacheNames()).toMatchSnapshot();
  });
});
