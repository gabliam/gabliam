export class AmqpConnectionError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpConnectionError.prototype);
  }
}
