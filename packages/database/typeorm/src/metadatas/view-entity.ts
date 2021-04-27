import { makeDecorator, Register } from '@gabliam/core';
import {
  Connection,
  SelectQueryBuilder,
  ViewEntity as typeormEntity,
} from 'typeorm';
import { TYPE } from '../constant';

// Recreate ViewEntityOptions => Typeorm doesn't export this
export interface ViewEntityOptions {
  /**
   * View name.
   * If not specified then naming strategy will generate view name from class name.
   */
  name?: string;
  /**
   * View expression.
   */
  expression?: string | ((connection: Connection) => SelectQueryBuilder<any>);
  /**
   * Database name. Used in Mysql and Sql Server.
   */
  database?: string;
  /**
   * Schema name. Used in Postgres and Sql Server.
   */
  schema?: string;
  /**
   * Indicates if schema synchronization is enabled or disabled for this entity.
   * If it will be set to false then schema sync will and migrations ignore this entity.
   * By default schema synchronization is enabled for all entities.
   */
  synchronize?: boolean;
  /**
   * Indicates if view should be materialized view.
   * It's supported by Postgres and Oracle.
   */
  materialized?: boolean;
}

/**
 * Type of the `ViewEntity` decorator / constructor function.
 */
export interface ViewEntityDecorator {
  /**
   * This decorator is used to mark classes that will be an entity view.
   * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
   *
   *
   * @usageNotes
   *
   * ```typescript
   * @ViewEntity()
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
  (name?: string, options?: ViewEntityOptions): ClassDecorator;

  /**
   * see the `@ViewEntity` decorator.
   */
  new (name?: string, options?: ViewEntityOptions): any;
}

/**
 * `ViewEntity` decorator and metadata.
 */
export interface ViewEntity {
  name?: string;

  options?: ViewEntityOptions;
}

export const ViewEntity: ViewEntityDecorator = makeDecorator(
  'ViewEntity',
  (name?: string, options?: ViewEntityOptions): ViewEntity => ({
    name,
    options,
  }),
  (cls, annotationInstance: ViewEntity) => {
    Register({ type: TYPE.Entity, id: cls, autobind: false })(cls);
    typeormEntity(annotationInstance.name, annotationInstance.options)(cls);
  },
);
