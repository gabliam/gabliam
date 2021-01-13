/* istanbul ignore next */
export class AmqpConnectionError extends Error {
  name = 'AmqpConnectionError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpConnectionError.prototype);

    this.message = `An error occurred on connection`;
  }
}
