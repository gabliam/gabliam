import { METADATA_KEY, ERRORS_MSGS } from '../constants';

/**
 * Type of the `Bean` decorator / constructor function.
 */
export interface CUnitDecorator {}

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
