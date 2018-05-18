import { MiddlewareDefinition, ValidatorOptions } from './interfaces';

export function isMiddlewareDefinition(
  obj: Object
): obj is MiddlewareDefinition {
  return (
    typeof obj === 'object' &&
    obj.hasOwnProperty('name') &&
    obj.hasOwnProperty('values')
  );
}

export function cleanPath(path: string) {
  return path.replace(/\/+/gi, '/');
}

export function isValidatorOptions(value: any): value is ValidatorOptions {
  return typeof value === 'object' && value.hasOwnProperty('validator');
}
