import { Cache } from '@gabliam/cache';
import * as Redis from 'ioredis';

export interface RedisCacheOptions {
  mode?: string;

  duration?: number;

  timeout?: number;

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
            }, this.options.timeout);
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

  async get<T>(key: string): Promise<T | undefined | null> {
    if (!(await this.hasKey(key))) {
      return undefined;
    }
    const realKey = this.getKey(key);
    try {
      return this.deserialize(await this.addTimeout(this.client.get(realKey)));
    } catch {
      /* istanbul ignore next */ {
        return Promise.resolve(undefined);
      }
    }
  }
  async put(key: string, value: any): Promise<void> {
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
        await this.addTimeout(
          this.client.set(
            realKey,
            JSON.stringify(value),
            this.options.mode,
            this.options.duration
          )
        );
      } else {
        await this.addTimeout(this.client.set(realKey, JSON.stringify(value)));
      }
    } catch {}
  }

  async putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): Promise<T | undefined | null> {
    if (!(await this.hasKey(key))) {
      await this.put(key, value);
      return null;
    }

    return await this.get<T>(key);
  }
  async evict(key: string): Promise<void> {
    try {
      await this.addTimeout(this.client.del(this.getKey(key)));
    } catch {}
  }

  async clear(): Promise<void> {
    try {
      await this.addTimeout(
        this.client.eval(
          `return redis.call('del', unpack(redis.call('keys', ARGV[1])))`,
          0,
          `${this.name}:*`
        )
      );
    } catch {}
  }

  private async hasKey(key: string) {
    try {
      return (
        (await this.addTimeout(this.client.exists(this.getKey(key)))) === 1
      );
    } catch {
      /* istanbul ignore next */ {
        return false;
      }
    }
  }

  private getKey(key: string) {
    return `${this.name}:${key}:${this.name}`;
  }

  private deserialize(value: any) {
    try {
      return JSON.parse(value);
    } catch {
      /* istanbul ignore next */ {
        return undefined;
      }
    }
  }
}
