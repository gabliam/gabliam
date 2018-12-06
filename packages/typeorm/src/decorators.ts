import {
  Entity as typeormEntity,
  ClassEntityChild as typeormClassEntityChild,
  SingleEntityChild as typeormSingleEntityChild,
  ClosureEntity as typeormClosureEntity,
  EntityOptions,
} from 'typeorm';
import { register } from '@gabliam/core';
import { TYPE, METADATA_KEY, ERRORS_MSGS } from './constant';

/**
 * Set the connection of the entitie
 */
export function CUnit(name: string) {
  return (target: any) => {
    if (Reflect.hasMetadata(METADATA_KEY.cunit, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_CUNIT_DECORATOR);
    }
    Reflect.defineMetadata(METADATA_KEY.cunit, name, target);
    return target;
  };
}

/**
 * This decorator is used to mark classes that will be an entity (table or document depend on database type).
 * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
 */
export function Entity(name?: string, options?: EntityOptions) {
  return (target: any) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormEntity(name, options)(target);
  };
}

/**
 * Special type of the entity used in the class-table inherited tables.
 */
export function ClassEntityChild(tableName?: string, options?: EntityOptions) {
  return (target: any) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormClassEntityChild(tableName, options)(target);
  };
}

/**
 * Special type of the table used in the single-table inherited tables.
 */
export function SingleEntityChild() {
  return (target: any) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormSingleEntityChild()(target);
  };
}

/**
 * Used on a entities that stores its children in a tree using closure design pattern.
 */
export function ClosureEntity(name?: string, options?: EntityOptions) {
  return (target: any) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormClosureEntity(name, options)(target);
  };
}
