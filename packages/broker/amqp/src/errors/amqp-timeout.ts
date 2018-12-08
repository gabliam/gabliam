export class AmqpTimeoutError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpTimeoutError.prototype);
  }
}
