/**
 * Exception when interceptor not implement Interceptor
 */
export class BadInterceptorError extends Error {
  name = 'BadInterceptorError';

  constructor(interceptor: Function) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BadInterceptorError.prototype);

    const name = interceptor.constructor
      ? interceptor.constructor.name
      : interceptor;

    this.message = `${name} must implement Interceptor interface`;
  }
}
