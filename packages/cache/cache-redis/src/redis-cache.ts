import { Cache } from '@gabliam/cache';
import Redis from 'ioredis';
import { promisify } from 'util';
import { gunzip, gzip } from 'zlib';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export interface RedisCacheOptions {
  mode?: string;

  duration?: number;

  timeout?: number;

  gzipEnabled?: boolean;

  redisOptions?: Redis.RedisOptions;
}

export class RedisCache implements Cache {
  private client!: Redis.Redis;
  private addTimeout: (promiseFn: Promise<any>) => Promise<any>;

  constructor(private name: string, private options: RedisCacheOptions = {}) {
    if (options.timeout) {
      this.addTimeout = (promiseFn: Promise<any>) =>
        Promise.race([
          promiseFn,
          new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('timeout');
            }, options.timeout);
          }),
        ]);
    } else {
      this.addTimeout = (promiseFn: Promise<any>) => promiseFn;
    }
  }

  async start() {
    this.client = new Redis(this.options.redisOptions);
  }

  async stop() {
    this.client.disconnect();
  }

  getName(): string {
    return this.name;
  }
  getNativeCache(): RedisCache {
    return this;
  }

  async get<T>(key: string, addTimeout = true): Promise<T | undefined | null> {
    const get = (async () => {
      if (!(await this.hasKey(key, false))) {
        return undefined;
      }
      const realKey = this.getKey(key);
      try {
        return this.deserialize(await this.client.getBuffer(realKey));
      } catch {
        /* istanbul ignore next */ {
          return Promise.resolve(undefined);
        }
      }
    })();
    if (addTimeout) {
      return this.addTimeout(get);
    }

    return get;
  }
  async put(key: string, value: any, addTimeout = true): Promise<void> {
    const put = (async () => {
      const realKey = this.getKey(key);
      try {
        // why ? for prevent this message :
        // node_redis: Deprecated: The SET command contains a "undefined" argument.
        // This is converted to a "undefined" string now and will return an error from v.3.0 on.
        // Please handle this in your code to make sure everything works as you intended it to.
        if (
          this.options.mode !== undefined &&
          this.options.duration !== undefined
        ) {
          await this.client.set(
            realKey,
            await this.serialize(value),
            this.options.mode,
            this.options.duration,
          );
        } else {
          await this.client.set(realKey, await this.serialize(value));
        }
      } catch {}
    })();
    if (addTimeout) {
      return this.addTimeout(put);
    }

    return put;
  }

  async putIfAbsent<T>(
    key: string,
    value: T | null | undefined,
    addTimeout = true,
  ): Promise<T | undefined | null> {
    const putIfAbsent = (async () => {
      if (!(await this.hasKey(key, false))) {
        await this.put(key, value, false);
        return null;
      }

      return await this.get<T>(key, false);
    })();

    if (addTimeout) {
      return this.addTimeout(putIfAbsent);
    }

    return putIfAbsent;
  }
  async evict(key: string, addTimeout = true): Promise<void> {
    const evict = (async () => {
      try {
        await this.client.del(this.getKey(key));
      } catch {}
    })();

    if (addTimeout) {
      await this.addTimeout(evict);
    } else {
      await evict;
    }
  }

  async clear(addTimeout = true): Promise<void> {
    const clear = (async () => {
      try {
        await this.client.eval(
          `return redis.call('del', unpack(redis.call('keys', ARGV[1])))`,
          0,
          `${this.name}:*`,
        );
      } catch {}
    })();

    if (addTimeout) {
      await this.addTimeout(clear);
    } else {
      await clear;
    }
  }

  private async hasKey(key: string, addTimeout: boolean) {
    const hasKey = (async () => {
      try {
        return (await this.client.exists(this.getKey(key))) === 1;
      } catch {
        /* istanbul ignore next */ {
          return false;
        }
      }
    })();

    if (addTimeout) {
      return this.addTimeout(hasKey);
    }

    return hasKey;
  }

  private getKey(key: string) {
    return `${this.name}:${key}:${this.name}`;
  }

  private async serialize(value: any) {
    try {
      if (this.options.gzipEnabled === true) {
        return <any>await gzipAsync(JSON.stringify(value));
      } else {
        return JSON.stringify(value);
      }
    } catch {
      return undefined;
    }
  }

  private async deserialize(value: any) {
    try {
      if (this.options.gzipEnabled === true) {
        return JSON.parse(<string>await gunzipAsync(value));
      } else {
        return JSON.parse(value.toString());
      }
    } catch {
      return undefined;
    }
  }
}
