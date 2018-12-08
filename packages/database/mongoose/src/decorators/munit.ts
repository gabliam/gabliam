import { METADATA_KEY, ERRORS_MSGS } from '../constants';

/**
 * Set the connection of the entitie
 */
export function MUnit(name: string) {
  return (target: any) => {
    if (Reflect.hasMetadata(METADATA_KEY.munit, target) === true) {
      throw new Error(ERRORS_MSGS.DUPLICATED_MUNIT_DECORATOR);
    }
    Reflect.defineMetadata(METADATA_KEY.munit, name, target);
    return target;
  };
}
