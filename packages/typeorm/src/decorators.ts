import {
  Entity as typeormEntity,
  AbstractEntity as typeormAbstractEntity,
  ClassEntityChild as typeormClassEntityChild,
  SingleEntityChild as typeormSingleEntityChild,
  ClosureEntity as typeormClosureEntity,
  EmbeddableEntity as typeormEmbeddableEntity,
  EntityOptions
} from 'typeorm';
import { register } from '@gabliam/core';
import { TYPE } from './constant';
import * as caller from 'caller';


/**
 * This decorator is used to mark classes that will be an entity (table or document depend on database type).
 * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
 */
export function Entity(name?: string, options?: EntityOptions) {
  const filePath = caller();
  return (target: Function) => {
    register(TYPE.Entity, { id: null, target, filePath })(target);
    typeormEntity(name, options)(target);
  };
}

/**
 * Abstract entity is a class that contains columns and relations for all entities that will inherit this entity.
 * Database table for the abstract entity is not created.
 */
export function AbstractEntity() {
  const filePath = caller();
  return (target: Function) => {
    register(TYPE.Entity, { id: null, target, filePath })(target);
    typeormAbstractEntity()(target);
  };
}

/**
 * Special type of the entity used in the class-table inherited tables.
 */
export function ClassEntityChild(tableName?: string, options?: EntityOptions) {
  const filePath = caller();
  return (target: Function) => {
    register(TYPE.Entity, { id: null, target, filePath })(target);
    typeormClassEntityChild(tableName, options)(target);
  };
}

/**
 * Special type of the table used in the single-table inherited tables.
 */
export function SingleEntityChild() {
  const filePath = caller();
  return (target: Function) => {
    register(TYPE.Entity, { id: null, target, filePath })(target);
    typeormSingleEntityChild()(target);
  };
}

/**
 * Used on a entities that stores its children in a tree using closure design pattern.
 */
export function ClosureEntity(name?: string, options?: EntityOptions) {
  const filePath = caller();
  return (target: Function) => {
    register(TYPE.Entity, { id: null, target, filePath })(target);
    typeormClosureEntity(name, options)(target);
  };
}

/**
 * This decorator is used on the entities that must be embedded into another entities.
 */
export function EmbeddableEntity() {
  const filePath = caller();
  return (target: Function) => {
    register(TYPE.Entity, { id: null, target, filePath })(target);
    typeormEmbeddableEntity()(target);
  };
}
