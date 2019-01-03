export class AmqpConfigIsMandatoryError extends Error {
  name = 'AmqpConfigIsMandatoryError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpConfigIsMandatoryError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `AmqpConfig is mandatory`;
  }
}
