/**
 * Exception next called multiple times
 */
export class NextCalledMulipleError extends Error {
  name = 'NextCalledMulipleError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NextCalledMulipleError.prototype);

    this.message = 'next() called multiple times';
  }
}
