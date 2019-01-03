export class MongoMUnitNotFoundError extends Error {
  name = 'MongoMUnitNotFoundError';

  constructor(munit: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MongoMUnitNotFoundError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `MUnit ${munit} not found`;
  }
}
