
/**
 * Reflect.hasOwnMetadata wrapper for exceptions
 * @see {Reflect.hasOwnMetadata}
 * @param  {string} key
 * @param  {any} target
 */
export function hasMetadata(key: string, target: any) {
  try {
    return Reflect.hasOwnMetadata(key, target);
  } catch (e) {
    return false;
  }
}
