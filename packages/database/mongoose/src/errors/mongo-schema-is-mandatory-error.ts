export class MongoSchemaIsMandatoryError extends Error {
  name = 'MongoSchemaIsMandatoryError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MongoSchemaIsMandatoryError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Schema is mandory. Add it with decorator or with static method`;
  }
}
