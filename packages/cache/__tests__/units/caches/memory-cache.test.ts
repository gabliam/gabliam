import { MemoryCache } from '../../../src/index';

let cache: MemoryCache;

beforeEach(async () => {
  cache = new MemoryCache('test');
  await cache.start();
});

test('cache', () => {
  expect(cache.getName()).toMatchSnapshot();
  expect(cache.getNativeCache()).toMatchSnapshot();
});

test('cache get & put', async () => {
  expect(await cache.get('test')).toMatchSnapshot();
  await cache.put('test', 'test');
  expect(cache).toMatchSnapshot();
  expect(await cache.get('test')).toMatchSnapshot();
});

test('cache putIfAbsent', async () => {
  await cache.put('test', 'test');
  await cache.putIfAbsent('test', 'testnew');
  await cache.putIfAbsent('test2', 'test2');
  await cache.putIfAbsent('test3', 'test3');
  expect(cache).toMatchSnapshot();
  expect(await cache.get('test')).toMatchSnapshot();
  expect(await cache.get('test2')).toMatchSnapshot();
});

test('evict', async () => {
  await cache.putIfAbsent('test', 'testnew');
  await cache.putIfAbsent('test2', 'test2');
  await cache.putIfAbsent('test3', 'test3');
  expect(cache).toMatchSnapshot();
  await cache.evict('test3');
});

test('clear', async () => {
  await cache.putIfAbsent('test', 'testnew');
  await cache.putIfAbsent('test2', 'test2');
  await cache.putIfAbsent('test3', 'test3');
  expect(cache).toMatchSnapshot();
  await cache.clear();
  expect(cache).toMatchSnapshot();
});
