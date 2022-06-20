import LRU from 'lru-cache';
import { Cache } from '../cache';

const DEFAULT_OPTIONS = {
  max: 50,
};

export class MemoryCache implements Cache {
  private name: string;

  private store: LRU<any, any>;

  private options: LRU.Options<any, any>;

  constructor(name: string, options: Partial<LRU.Options<any, any>> = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.name = name;
  }

  async start() {
    this.store = new LRU(this.options);
  }

  async stop() {
    this.store.clear();
  }

  getName(): string {
    return this.name;
  }

  getNativeCache() {
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
    value: T | null | undefined,
  ): Promise<T | null | undefined> {
    if (!this.store.has(key)) {
      this.store.set(key, value);
      return null;
    }
    return this.store.get(key);
  }

  async evict(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
