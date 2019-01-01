import { makeDecorator } from '@gabliam/core/src';
import { ERRORS_MSGS, METADATA_KEY } from '../constant';

/**
 * Type of the `CacheGroup` decorator / constructor function.
 */
export interface CacheGroupDecorator {
  /**
   * Decorator that marks a class to use a specific cache group
   *
   * @usageNotes
   *
   * ```typescript
   * @CacheGroup('test')
   * @Service()
   * class GretterService {
   *    constructor(private gretter: Gretter) {
   *       gretter.greet();
   *    }
   * }
   * ```
   */
  (cacheGroupName: string): ClassDecorator;

  /**
   * see the `@Service` decorator.
   */
  new (cacheGroupName: string): any;
}

/**
 * `CacheGroup` decorator and metadata.
 */
export interface CacheGroup {
  /**
   * Name of cache group
   */
  cacheGroupName: string;
}

export const CacheGroup: CacheGroupDecorator = makeDecorator(
  METADATA_KEY.cacheGroup,
  (cacheGroupName: string): CacheGroup => ({ cacheGroupName }),
  undefined,
  true,
  ERRORS_MSGS.DUPLICATED_CACHE_DECORATOR
);
