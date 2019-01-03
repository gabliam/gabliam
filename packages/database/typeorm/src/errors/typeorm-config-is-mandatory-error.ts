export class TypeormConfigIsMandatoryError extends Error {
  name = 'TypeormConfigIsMandatoryError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TypeormConfigIsMandatoryError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `connectionOptions is mandatory.`;
  }
}
