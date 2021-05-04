import {
  inversifyInterfaces,
  makePropAndAnnotationAndParamDecorator,
} from '@gabliam/core';
import { METADATA_KEY } from '../constants';

export type PipeId = inversifyInterfaces.ServiceIdentifier<any> | Object;

/**
 * Type of the `UsePipes` decorator / constructor function.
 */
export interface UsePipesDecorator {
  /**
   * Decorator that marks a class or a property or param to use an interceptor.
   *
   * @usageNotes
   *
   * Injection of interceptor that are created with @Service
   * interceptor can be inject at the top of controller
   * (The interceptor is valid for all method) or on method
   *
   * The following example use a interceptor on property
   *
   * ```typescript
   * @RestController()
   * class Sample {
   *    @Get('/hello')
   *    hello() {
   *      return 'hello world';
   *    }
   * }
   * ```
   */
  (...ids: PipeId[]): any;

  /**
   * see the `@UsePipes` decorator.
   */
  new (...ids: PipeId[]): any;
}

/**
 * `UsePipes` decorator and metadata.
 */
export interface UsePipes {
  ids: PipeId[];
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UsePipes: UsePipesDecorator = makePropAndAnnotationAndParamDecorator(
  METADATA_KEY.pipe,
  (...ids: PipeId[]): UsePipes => ({
    ids,
  }),
);
