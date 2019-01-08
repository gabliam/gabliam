/* istanbul ignore next */
export class AmqpMessageIsNullError extends Error {
  name = 'AmqpMessageIsNullError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpMessageIsNullError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Message is null.`;
  }
}
