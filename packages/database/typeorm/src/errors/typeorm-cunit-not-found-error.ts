export class TypeormCUnitNotFoundError extends Error {
  name = 'TypeormCUnitNotFoundError';

  constructor(cunit: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TypeormCUnitNotFoundError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `CUnit ${cunit} not found`;
  }
}
