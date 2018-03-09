import { Cache } from '@gabliam/cache';
import { createClient, RedisClient, Multi, ClientOpts } from 'redis';
import * as bluebird from 'bluebird';

bluebird.promisifyAll(RedisClient.prototype);
bluebird.promisifyAll(Multi.prototype);

export interface RedisCacheOptions {
  mode?: string;

  duration?: number;

  redisOptions?: ClientOpts;
}

export class RedisCache implements Cache {
  private client!: RedisClient;

  constructor(private name: string, private options: RedisCacheOptions = {}) {}

  async start() {
    this.client = createClient(this.options.redisOptions);
  }

  async stop() {
    this.client.end(true);
  }

  getName(): string {
    return this.name;
  }
  getNativeCache(): RedisCache {
    return this;
  }

  async get<T>(key: string): Promise<T | undefined | null> {
    const realKey = this.getKey(key);
    try {
      return this.deserialize(await this.client.getAsync<T>(realKey));
    } catch {
      /* istanbul ignore next */ {
        return Promise.resolve(undefined);
      }
    }
  }
  async put(key: string, value: any): Promise<void> {
    if (value === undefined) {
      return;
    }

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
        await this.client.setAsync(
          realKey,
          JSON.stringify(value),
          this.options.mode,
          this.options.duration
        );
      } else {
        await this.client.setAsync(realKey, JSON.stringify(value));
      }
    } catch {}
  }

  async putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): Promise<T | undefined | null> {
    const result = await this.get<T>(key);
    if (result === undefined || result === null) {
      await this.put(key, value);
      return null;
    }

    return result;
  }
  async evict(key: string): Promise<void> {
    try {
      await this.client.delAsync(this.getKey(key));
    } catch {}
  }

  async clear(): Promise<void> {
    try {
      await this.client.evalAsync(
        `return redis.call('del', unpack(redis.call('keys', ARGV[1])))`,
        0,
        `${this.name}:*`
      );
    } catch {}
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
