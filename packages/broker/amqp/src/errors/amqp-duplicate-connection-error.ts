export class AmqpDuplicateConnectionError extends Error {
  name = 'AmqpDuplicateConnectionError';

  constructor(connectionName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpDuplicateConnectionError.prototype);

    this.message = `Duplicate connection '${connectionName}'`;
  }
}
