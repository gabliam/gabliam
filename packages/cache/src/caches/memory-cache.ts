import { Cache } from '../cache';
import * as LRU from 'lru-cache';

export class MemoryCache implements Cache {
  private name: string;

  private store: any;

  constructor(name: string, private options?: LRU.Options) {
    this.name = name;
  }

  async start() {
    this.store = new LRU(this.options);
  }

  async stop() {
    this.store.reset();
  }

  getName(): string {
    return this.name;
  }
  getNativeCache(): object {
    return this;
  }
  async get<T>(key: string): Promise<T | null | undefined> {
    return this.store.get(key);
  }
  async put(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  async putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): Promise<T | null | undefined> {
    if (!this.store.has(key)) {
      this.store.set(key, value);
      return null;
    }
    return this.store.get(key);
  }
  async evict(key: string): Promise<void> {
    this.store.del(key);
  }
  async clear(): Promise<void> {
    this.store.reset();
  }
}
