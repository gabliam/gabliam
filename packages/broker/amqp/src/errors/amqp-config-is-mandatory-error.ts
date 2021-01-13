export class AmqpConfigIsMandatoryError extends Error {
  name = 'AmqpConfigIsMandatoryError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpConfigIsMandatoryError.prototype);

    this.message = `AmqpConfig is mandatory`;
  }
}
