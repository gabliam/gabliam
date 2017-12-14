import * as redis from 'redis';

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    getAsync<R>(key: string): Promise<R>;
    setAsync(
      key: string,
      value: string,
      mode?: string,
      duration?: number
    ): Promise<void>;

    delAsync(key: string): Promise<void>;

    evalAsync<R>(...args: any): Promise<R>;
  }
}
