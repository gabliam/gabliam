/* istanbul ignore next */
export class AmqpMessageIsNullError extends Error {
  name = 'AmqpMessageIsNullError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpMessageIsNullError.prototype);

    this.message = `Message is null.`;
  }
}
