export class AmqpTimeoutError extends Error {
  name = 'AmqpTimeoutError';

  constructor(m: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpTimeoutError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Timeout on operation: ${m}`;
  }
}
