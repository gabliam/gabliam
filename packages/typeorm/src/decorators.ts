import {
  Entity as typeormEntity,
  ClassEntityChild as typeormClassEntityChild,
  SingleEntityChild as typeormSingleEntityChild,
  ClosureEntity as typeormClosureEntity,
  EntityOptions
} from 'typeorm';
import { register } from '@gabliam/core';
import { TYPE } from './constant';

/**
 * This decorator is used to mark classes that will be an entity (table or document depend on database type).
 * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
 */
export function Entity(name?: string, options?: EntityOptions) {
  return (target: Function) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormEntity(name, options)(target);
  };
}

/**
 * Special type of the entity used in the class-table inherited tables.
 */
export function ClassEntityChild(tableName?: string, options?: EntityOptions) {
  return (target: Function) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormClassEntityChild(tableName, options)(target);
  };
}

/**
 * Special type of the table used in the single-table inherited tables.
 */
export function SingleEntityChild() {
  return (target: Function) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormSingleEntityChild()(target);
  };
}

/**
 * Used on a entities that stores its children in a tree using closure design pattern.
 */
export function ClosureEntity(name?: string, options?: EntityOptions) {
  return (target: Function) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormClosureEntity(name, options)(target);
  };
}
