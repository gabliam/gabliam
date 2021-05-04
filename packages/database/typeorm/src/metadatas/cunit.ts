/* eslint-disable @typescript-eslint/no-redeclare */
import { makeDecorator } from '@gabliam/core';
import { METADATA_KEY } from '../constant';

/**
 * Type of the `CUnit` decorator / constructor function.
 */
export interface CUnitDecorator {
  /**
   * Decorator that marks a class (a typeorm Entity) to use a specific connection
   *
   * @usageNotes
   *
   * ```typescript
   * @CUnit('test')
   * @Entity()
   * export class Photo {
   *   @PrimaryGeneratedColumn() id: number;
   *
   *   @Column({
   *     length: 500
   *   })
   *   name: string;
   *
   *   @Column('text') description: string;
   *
   *   @Column() fileName: string;
   *
   *   @Column('int') views: number;
   *
   *   @Column() isPublished: boolean;
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
);
