import { MiddlewareDefinition } from '@gabliam/rest-decorators';

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
