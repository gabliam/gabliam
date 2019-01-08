import {
  Entity as typeormEntity,
  ChildEntity as typeormChildEntity,
  EntityOptions,
} from 'typeorm';
import { Register, makeDecorator } from '@gabliam/core';
import { TYPE, METADATA_KEY, ERRORS_MSGS } from './constant';

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
  true,
  ERRORS_MSGS.DUPLICATED_CUNIT_DECORATOR
);

/**
 * Type of the `Entity` decorator / constructor function.
 */
export interface EntityDecorator {
  /**
   * This decorator is used to mark classes that will be an entity
   * (table or document depend on database type).
   * Database schema will be created for all classes decorated with it,
   * and Repository can be retrieved and used for it.
   *
   * @usageNotes
   *
   * ```typescript
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
  (name?: string, options?: EntityOptions): ClassDecorator;

  /**
   * see the `@Entity` decorator.
   */
  new (name?: string, options?: EntityOptions): any;
}

/**
 * `Entity` decorator and metadata.
 */
export interface Entity {
  name?: string;

  options?: EntityOptions;
}

export const Entity: EntityDecorator = makeDecorator(
  'Entity',
  (name?: string, options?: EntityOptions): Entity => ({ name, options }),
  (cls, annotationInstance: Entity) => {
    Register({ type: TYPE.Entity, id: cls, autobind: false })(cls);
    typeormEntity(annotationInstance.name, annotationInstance.options)(cls);
  }
);

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
