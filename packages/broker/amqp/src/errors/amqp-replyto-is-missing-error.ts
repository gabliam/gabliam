export class AmqpReplytoIsMissingError extends Error {
  name = 'AmqpReplytoIsMissingError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpReplytoIsMissingError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `ReplyTo is missing.`;
  }
}
