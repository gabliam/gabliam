import { register } from '@gabliam/core';
import {
  ChildEntity as typeormChildEntity,
  Entity as typeormEntity,
  EntityOptions,
} from 'typeorm';
import { METADATA_KEY, TYPE } from './constant';

/**
 * Set the connection of the entitie
 */
export function CUnit(name: string) {
  return (target: any) => {
    let metadata: string[] = [];
    if (Reflect.hasMetadata(METADATA_KEY.cunit, target) === true) {
      metadata = Reflect.getMetadata(METADATA_KEY.cunit, target);
    }
    metadata.push(name);

    Reflect.defineMetadata(METADATA_KEY.cunit, metadata, target);
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
 * Special type of the table used in the single-table inherited tables.
 */
export function ChildEntity() {
  return (target: any) => {
    register(TYPE.Entity, { id: target, target })(target);
    typeormChildEntity()(target);
  };
}
