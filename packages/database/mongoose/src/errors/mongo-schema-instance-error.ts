export class MongoSchemaInstanceError extends Error {
  name = 'MongoSchemaInstanceError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MongoSchemaInstanceError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Schema must be an instance of mongoose.Schema.`;
  }
}
