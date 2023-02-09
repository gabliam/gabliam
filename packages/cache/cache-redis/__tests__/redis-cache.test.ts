import Redis from 'ioredis';
import RedisCache from '../src/index';

let cache: RedisCache;
let cache2: RedisCache;
let cache3: RedisCache;
let client: Redis;

beforeAll(async () => {
  cache = new RedisCache('test');
  cache2 = new RedisCache('test2', {
    duration: 2,
    mode: 'EX',
    gzipEnabled: true,
  });
  cache3 = new RedisCache('test2', {
    timeout: 1000,
  });
  await cache.start();
  await cache2.start();
  await cache3.start();
  client = new Redis();
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
  client.disconnect();
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
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

test('put with duration', async () => {
  await cache2.put('test', 'test');
  expect(await cache2.get('test')).toMatchSnapshot();
  await sleep(3);
  expect(await cache2.get('test')).toMatchSnapshot();
});

test.skip('get & put with timeout', async () => {
  expect(await cache3.get('test')).toMatchSnapshot();
  await cache3.put('test', 'test');
  expect(await cache3.get('test')).toMatchSnapshot();
  expect(await cache3.get('test')).toMatchSnapshot();

  client.debug('sleep', 0.5);
  expect(await cache3.get('test')).toMatchSnapshot();
  expect(await cache3.get('test')).toMatchSnapshot();

  await cache3.put('test', undefined);
  expect(await cache3.get('test')).toMatchSnapshot();
  await cache3.put('test2', null);
  expect(await cache3.get('test2')).toMatchSnapshot();
});

test.skip('errors get timeout', async () => {
  await cache3.put('test', 'test');
  client.debug('sleep', 3);
  await expect(cache3.get('test')).rejects.toMatchSnapshot();
  await sleep(3);
});

test.skip('put timeout', async () => {
  client.debug('sleep', 3);
  await sleep(1);
  await expect(cache3.put('test', 'test')).rejects.toMatchSnapshot();
  await sleep(2);
});
