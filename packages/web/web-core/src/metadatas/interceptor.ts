import {
  inversifyInterfaces,
  makePropAndAnnotationDecorator,
} from '@gabliam/core';
import { METADATA_KEY } from '../constants';

/**
 * Type of the `UseInterceptors` decorator / constructor function.
 */
export interface UseInterceptorsDecorator {
  /**
   * Decorator that marks a class or a property to use an interceptor.
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
   *    @UseInterceptors(LogInterceptor)
   *    @Get('/hello')
   *    hello() {
   *      return 'hello world';
   *    }
   * }
   * ```
   */
  (...ids: inversifyInterfaces.ServiceIdentifier<any>[]): any;

  /**
   * see the `@UseInterceptors` decorator.
   */
  new (...ids: inversifyInterfaces.ServiceIdentifier<any>[]): any;
}

/**
 * `UseInterceptors` decorator and metadata.
 */
export interface UseInterceptors {
  ids: inversifyInterfaces.ServiceIdentifier<any>[];
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UseInterceptors: UseInterceptorsDecorator = makePropAndAnnotationDecorator(
  METADATA_KEY.interceptor,
  (...ids: inversifyInterfaces.ServiceIdentifier<any>[]): UseInterceptors => ({
    ids,
  }),
);
