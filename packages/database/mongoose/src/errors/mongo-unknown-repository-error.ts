export class MongoUnknownRepositoryError extends Error {
  name = 'MongoUnknownRepositoryError';

  constructor(repositoryName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MongoUnknownRepositoryError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Unknown repository ${repositoryName}`;
  }
}
