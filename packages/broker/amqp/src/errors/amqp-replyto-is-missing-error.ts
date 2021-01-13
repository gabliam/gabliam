/* istanbul ignore next */
export class AmqpReplytoIsMissingError extends Error {
  name = 'AmqpReplytoIsMissingError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpReplytoIsMissingError.prototype);

    this.message = `ReplyTo is missing.`;
  }
}
