import { METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';

/**
 * Type of the `InjectContainer` decorator / constructor function.
 */
export interface InjectContainerDecorator {
  /**
   * Decorator that marks a class as an Gabliam InjectContainer.
   *
   * This class is loaded by the framework in config phase and all beans are injected in the container
   *
   * @usageNotes
   *
   * ```typescript
   *  @InjectContainer()
   *  class Gretter {
   *    @Init()
   *    init() {
   *      this[CONTAINER].get();
   *    }
   *  }
   * ```
   */
  (): ClassDecorator;

  /**
   * see the `@Config` decorator.
   */
  new (): any;
}

export const InjectContainer: InjectContainerDecorator = makeDecorator(
  METADATA_KEY.injectContainer
);
