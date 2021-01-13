/**
 * Exception when a decorator must be unique and user use 2 time the decorator
 */
export class DecoratorUniqError extends Error {
  name = 'DecoratorUniqError';

  constructor(uniqError: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DecoratorUniqError.prototype);

    this.message = uniqError;
  }
}
