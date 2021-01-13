/**
 * Exception when an invalid option is passed to `@Value`
 */
export class InvalidValueDecoratorError extends Error {
  name = 'InvalidValueDecoratorError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidValueDecoratorError.prototype);

    this.message = `Options of @Value decorator must be a string or a ValueOptions.`;
  }
}
