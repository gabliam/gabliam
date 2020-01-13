import { makeDecorator, Register } from '@gabliam/core';
import { ChildEntity as typeormChildEntity } from 'typeorm';
import { TYPE } from '../constant';

/**
 * Type of the `ChildEntity` decorator / constructor function.
 */
export interface ChildEntityDecorator {
  /**
   * Special type of the table used in the single-table inherited tables.
   *
   * @usageNotes
   *
   * ```typescript
   * @Entity()
   * @TableInheritance({ column: { type: "varchar", name: "type" } })
   * export class Content {
   *
   *     @PrimaryGeneratedColumn()
   *     id: number;
   *
   *     @Column()
   *     title: string;
   *
   *     @Column()
   *     description: string;
   *
   * }
   *
   * @ChildEntity()
   * export class Photo extends Content {
   *
   *     @Column()
   *     size: string;
   *
   * }
   * ```
   */
  (): ClassDecorator;

  /**
   * see the `@ChildEntity` decorator.
   */
  new (): any;
}

export const ChildEntity: ChildEntityDecorator = makeDecorator(
  'ChildEntity',
  undefined,
  cls => {
    Register({ type: TYPE.Entity, id: cls, autobind: false })(cls);
    typeormChildEntity()(cls);
  }
);
