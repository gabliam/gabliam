import { METADATA_KEY } from '../constants';
import { makePropDecorator } from '../decorator';

/**
 * Type of the `PreDestroy` decorator / constructor function.
 */
export interface PreDestroyDecorator {
  /**
   * Decorator that marks a class field as an OnMissingBean property and supplies configuration metadata.
   *
   * The property was be called before the class was destroyed
   *
   * @usageNotes
   *
   * ```typescript
   * @Service()
   * class RedisService {
   *  redis: ioredis;
   *
   *  init() {
   *    this.redis = new Redis();
   *  }
   *
   *  @preDestroy()
   *  destroy() {
   *    this.redis.close();
   *  }
   * }
   * ```
   */
  (): any;

  /**
   * see the `@PreDestroy` decorator.
   */
  new (): any;
}

export const PreDestroy: PreDestroyDecorator = makePropDecorator(
  METADATA_KEY.preDestroy
);
