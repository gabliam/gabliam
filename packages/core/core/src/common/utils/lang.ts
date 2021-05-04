/**
 * Test if val is an object
 */
export const isObject = (val?: any): val is Object => {
  const type = typeof val;
  return val != null && (type === 'object' || type === 'function');
};
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined';
export const validatePath = (path?: string): string =>
  // eslint-disable-next-line no-nested-ternary
  path ? (path.charAt(0) !== '/' ? `/${path}` : path) : '';
export const isFunction = (fn: any): boolean => typeof fn === 'function';
export const isString = (fn: any): fn is string => typeof fn === 'string';
export const isConstructor = (fn: any): boolean => fn === 'constructor';
export const isNil = (obj: any): boolean => isUndefined(obj) || obj === null;
export const isEmpty = (array: any): boolean => !(array && array.length > 0);
export const isSymbol = (fn: any): fn is symbol => typeof fn === 'symbol';
