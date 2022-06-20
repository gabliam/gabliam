import { MemoryCache } from '../../../src/index';

let cache: MemoryCache;

beforeAll(async () => {
  cache = new MemoryCache('test', { max: 8 });
  await cache.start();
});

afterEach(async () => {
  await cache.clear();
});

afterAll(async () => {
  await cache.stop();
});

test('cache', () => {
  expect(cache.getName()).toMatchSnapshot();
  expect(cache.getNativeCache()).toMatchSnapshot();
});

test('cache get & put', async () => {
  expect(await cache.get('test')).toMatchSnapshot();
  await cache.put('test', 'test');
  expect(await cache.get('test')).toMatchSnapshot();
  expect(await cache.get('test')).toMatchSnapshot();
  await cache.put('test', undefined);
  expect(await cache.get('test')).toMatchSnapshot();
  await cache.put('test2', null);
  expect(await cache.get('test2')).toMatchSnapshot();
});

test('cache putIfAbsent', async () => {
  await cache.put('test', 'test');
  expect(await cache.putIfAbsent('test', 'testnew')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test2', 'test2')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test3', 'test3')).toMatchSnapshot();
  expect(cache).toMatchSnapshot();
  expect(await cache.get('test')).toMatchSnapshot();
  expect(await cache.get('test2')).toMatchSnapshot();
});

test('evict', async () => {
  expect(await cache.putIfAbsent('test', 'testnew')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test2', 'test2')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test3', 'test3')).toMatchSnapshot();
  expect(cache).toMatchSnapshot();
  await cache.evict('test3');
});

test('clear', async () => {
  expect(await cache.putIfAbsent('test', 'testnew')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test2', 'test2')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test3', 'test3')).toMatchSnapshot();
  expect(cache).toMatchSnapshot();
  await cache.clear();
  expect(cache).toMatchSnapshot();
});
