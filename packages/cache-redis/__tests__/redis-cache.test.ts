import RedisCache from '../src/index';
import * as Redis from 'ioredis';

let cache: RedisCache;
let cache2: RedisCache;
let cache3: RedisCache;

beforeAll(async () => {
  cache = new RedisCache('test');
  cache2 = new RedisCache('test2', {
    duration: 2,
    mode: 'EX',
  });
  cache3 = new RedisCache('test2', {
    timeout: 500,
  });
  await cache.start();
  await cache2.start();
  await cache3.start();
});

afterEach(async () => {
  await cache.clear();
  await cache2.clear();
  await cache3.clear();
});

afterAll(async () => {
  await cache.stop();
  await cache2.stop();
  await cache3.stop();
});

test('cache', () => {
  expect(cache.getName()).toMatchSnapshot();
  expect(cache.getNativeCache()).toBeInstanceOf(RedisCache);
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
  expect(await cache.get('test')).toMatchSnapshot();
  expect(await cache.get('test2')).toMatchSnapshot();
});

test('evict', async () => {
  expect(await cache.putIfAbsent('test', 'testnew')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test2', 'test2')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test3', 'test3')).toMatchSnapshot();
  expect(await cache.get('test3')).toMatchSnapshot();
  await cache.evict('test3');
  expect(await cache.get('test3')).toMatchSnapshot();
});

test('clear', async () => {
  expect(await cache.putIfAbsent('test', 'testnew')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test2', 'test2')).toMatchSnapshot();
  expect(await cache.putIfAbsent('test3', 'test3')).toMatchSnapshot();
  expect(await cache.get('test')).toMatchSnapshot();
  expect(await cache.get('test2')).toMatchSnapshot();
  expect(await cache.get('test3')).toMatchSnapshot();
  await cache.clear();
  expect(await cache.get('test')).toMatchSnapshot();
  expect(await cache.get('test2')).toMatchSnapshot();
  expect(await cache.get('test3')).toMatchSnapshot();
});

function sleep(sec: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

test('put with duration', async () => {
  await cache2.put('test', 'test');
  expect(await cache2.get('test')).toMatchSnapshot();
  await sleep(3);
  expect(await cache2.get('test')).toMatchSnapshot();
});

test('get & put with timeout', async () => {
  expect(await cache3.get('test')).toMatchSnapshot();
  await cache3.put('test', 'test');
  expect(await cache3.get('test')).toMatchSnapshot();
  expect(await cache3.get('test')).toMatchSnapshot();

  const client = new Redis();
  client.debug('sleep', 2);
  await new Promise(resolve => setTimeout(resolve, 500));
  expect(await cache3.get('test')).toMatchSnapshot();
  await new Promise(resolve => setTimeout(resolve, 1700));
  expect(await cache3.get('test')).toMatchSnapshot();

  await cache3.put('test', undefined);
  expect(await cache3.get('test')).toMatchSnapshot();
  await cache3.put('test2', null);
  expect(await cache3.get('test2')).toMatchSnapshot();

  client.disconnect();
});
