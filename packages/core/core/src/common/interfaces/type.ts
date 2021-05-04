/**
 *
 * Represents a type that a Service or other object is instances of.
 *
 * An example of a `Type` is `MyCustomService` class, which in JavaScript is be represented by
 * the `MyCustomService` constructor function.
 */
export const Type = Function;

export function isType(v: any): v is Type<any> {
  return typeof v === 'function';
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Type<T> = new (...args: any[]) => T;

export type Mutable<T extends { [x: string]: any }, K extends string> = {
  [P in K]: T[P];
};
