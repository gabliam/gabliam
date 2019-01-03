export class AmqpQueueDoesntExistError extends Error {
  name = 'AmqpQueueDoesntExistError';

  constructor(queueName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpQueueDoesntExistError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Queue "${queueName}" doesn't exist.`;
  }
}
