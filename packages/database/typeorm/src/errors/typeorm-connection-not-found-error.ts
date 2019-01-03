export class TypeormConnectionNotFoundError extends Error {
  name = 'TypeormConnectionNotFoundError';

  constructor(connectionName: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TypeormConnectionNotFoundError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Connection ${connectionName} not found`;
  }
}
