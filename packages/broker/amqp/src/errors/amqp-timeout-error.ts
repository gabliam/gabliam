export class AmqpTimeoutError extends Error {
  name = 'AmqpTimeoutError';

  constructor(m: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpTimeoutError.prototype);

    this.message = `Timeout on operation: ${m}`;
  }
}
