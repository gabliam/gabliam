/* eslint-disable @typescript-eslint/no-redeclare */
import { makeDecorator, Register } from '@gabliam/core';
import { Entity as typeormEntity, EntityOptions } from 'typeorm';
import { TYPE } from '../constant';

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
  },
);
