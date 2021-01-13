export class TypeormConnectionNotFoundError extends Error {
  name = 'TypeormConnectionNotFoundError';

  constructor(connectionName: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TypeormConnectionNotFoundError.prototype);

    this.message = `Connection ${connectionName} not found`;
  }
}
