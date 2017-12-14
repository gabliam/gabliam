import { Cache } from '../cache';

export class NoOpCache implements Cache {
  private name: string;

  constructor(name: string, options?: object) {
    this.name = name;
  }

  async start() {}

  async stop() {}

  getName(): string {
    return this.name;
  }
  getNativeCache(): object {
    return this;
  }
  async get<T>(key: string): Promise<T | undefined | null> {
    return Promise.resolve(undefined);
  }
  async put(key: string, value: any): Promise<void> {}

  async putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): Promise<T | undefined | null> {
    return undefined;
  }
  async evict(key: string): Promise<void> {}
  async clear(): Promise<void> {}
}
