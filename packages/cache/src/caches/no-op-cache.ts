import { Cache } from '../cache';

export class NoOpCache implements Cache {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }
  getName(): string {
    return this.name;
  }
  getNativeCache(): object {
    return this;
  }
  get<T>(key: string): T | undefined | null {
    return undefined;
  }
  put(key: string, value: any): void {}
  putIfAbsent<T>(
    key: string,
    value: T | null | undefined
  ): T | undefined | null {
    return undefined;
  }
  evict(key: string): void {}
  clear(): void {}
}
