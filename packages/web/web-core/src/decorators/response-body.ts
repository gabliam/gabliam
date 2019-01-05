import { METADATA_KEY } from '../constants';
import { makePropDecorator } from '@gabliam/core/src';

/**
 * Type of the `ResponseBody` decorator / constructor function.
 */
export interface ResponseBodyDecorator {
  /**
   * Decorator that marks a method that return a json.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @ResponseBody()
   *    @Get('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (): MethodDecorator;

  /**
   * see the `@ResponseBody` decorator.
   */
  new (): any;
}

export const ResponseBody: ResponseBodyDecorator = makePropDecorator(
  METADATA_KEY.responseBody
);
