import * as co from 'co';

export type gabliamValue<T = any> =
  | Observable
  | IterableIterator<T>
  | Promise<T>
  | T;

/**
 * Check if `obj` is a generator.
 */
function isGenerator(obj: any) {
  return 'function' === typeof obj.next && 'function' === typeof obj.throw;
}

interface Observable {
  subscribe(
    success: (val: any) => void,
    error: (error: any) => void,
    finish: () => void
  ): void;
}

/**
 * Check if `obj` is an observable
 */
const isObservable = (obj: any): obj is Observable => {
  return Boolean(
    obj &&
      typeof obj.subscribe === 'function' &&
      obj.constructor.name === 'Observable'
  );
};

/**
 * Convert observable to promise
 */
function observableToPromise<T>(obs: Observable): Promise<T> {
  return new Promise((resolve, reject) => {
    let val: any;
    obs.subscribe((x: any) => (val = x), reject, () => resolve(val));
  });
}

/**
 * Convert `value` to promise
 * Value can be promise, generator, or others value
 * Stream isn't compatible
 */
export function toPromise<T = any>(
  value: gabliamValue
): Promise<T | undefined> {
  if (value === undefined) {
    return Promise.resolve(undefined);
  }

  if (isObservable(value)) {
    return observableToPromise<T>(value);
  }

  if (!isGenerator(value)) {
    return Promise.resolve<T>(value);
  }
  return co<T>(value);
}
