export class MongoConnectionNotFoundError extends Error {
  name = 'MongoConnectionNotFoundError';

  constructor(connectionName: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MongoConnectionNotFoundError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Connection ${connectionName} not found`;
  }
}
