import { MemoryCache } from '../../../src/index';

let cache: MemoryCache;

beforeEach(() => {
  cache = new MemoryCache('test');
});

test('cache', () => {
  expect(cache.getName()).toMatchSnapshot();
  expect(cache.getNativeCache()).toMatchSnapshot();
});

test('cache get & put', () => {
  expect(cache.get('test')).toMatchSnapshot();
  cache.put('test', 'test');
  expect(cache).toMatchSnapshot();
  expect(cache.get('test')).toMatchSnapshot();
});

test('cache putIfAbsent', () => {
  cache.put('test', 'test');
  cache.putIfAbsent('test', 'testnew');
  cache.putIfAbsent('test2', 'test2');
  cache.putIfAbsent('test3', 'test3');
  expect(cache).toMatchSnapshot();
  expect(cache.get('test')).toMatchSnapshot();
  expect(cache.get('test2')).toMatchSnapshot();
});

test('evict', () => {
  cache.putIfAbsent('test', 'testnew');
  cache.putIfAbsent('test2', 'test2');
  cache.putIfAbsent('test3', 'test3');
  expect(cache).toMatchSnapshot();
  cache.evict('test3');
});

test('clear', () => {
  cache.putIfAbsent('test', 'testnew');
  cache.putIfAbsent('test2', 'test2');
  cache.putIfAbsent('test3', 'test3');
  expect(cache).toMatchSnapshot();
  cache.clear();
  expect(cache).toMatchSnapshot();
});
