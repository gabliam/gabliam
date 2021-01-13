export class TypeormCUnitNotFoundError extends Error {
  name = 'TypeormCUnitNotFoundError';

  constructor(cunit: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TypeormCUnitNotFoundError.prototype);

    this.message = `CUnit ${cunit} not found`;
  }
}
