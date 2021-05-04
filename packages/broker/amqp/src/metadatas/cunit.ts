/* eslint-disable @typescript-eslint/no-redeclare */
import { makeDecorator } from '@gabliam/core';
import { ERRORS_MSGS, METADATA_KEY } from '../constants';

/**
 * Type of the `CUnit` decorator / constructor function.
 */
export interface CUnitDecorator {
  /**
   * Decorator that marks a class to use a specific connection
   *
   * @usageNotes
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitListener('test')
   *    hello() {
   *      console.log('Hello');
   *    }
   * }
   * ```
   */
  (name: string): ClassDecorator;

  /**
   * see the `@CUnit` decorator.
   */
  new (name: string): any;
}

/**
 * `CUnit` decorator and metadata.
 */
export interface CUnit {
  /**
   * Name of the connection
   */
  name: string;
}

export const CUnit: CUnitDecorator = makeDecorator(
  METADATA_KEY.cunit,
  (name: string): CUnit => ({ name }),
  undefined,
  true,
  ERRORS_MSGS.DUPLICATED_CUNIT_DECORATOR,
);
