export class MongoConfigIsMandatoryError extends Error {
  name = 'MongoConfigIsMandatoryError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MongoConfigIsMandatoryError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `mongooseConfiguration is mandatory.`;
  }
}
