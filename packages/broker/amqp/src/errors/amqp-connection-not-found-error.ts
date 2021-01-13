export class AmqpConnectionNotFoundError extends Error {
  name = 'AmqpConnectionNotFoundError';

  constructor(connectionName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpConnectionNotFoundError.prototype);

    this.message = `Connection '${connectionName}' not found`;
  }
}
