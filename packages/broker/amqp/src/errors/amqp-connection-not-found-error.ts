export class AmqpConnectionNotFoundError extends Error {
  name = 'AmqpConnectionNotFoundError';

  constructor(connectionName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpConnectionNotFoundError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Connection '${connectionName}' not found`;
  }
}
