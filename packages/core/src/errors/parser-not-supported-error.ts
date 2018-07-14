/**
 * Exception when paser is not supported by Gabliam
 */
export class ParserNotSupportedError extends Error {
  name = 'ParserNotSupportedError';

  constructor(parserName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParserNotSupportedError.prototype);
    this.message = `The parser "${parserName}" is not supported by Gabliam`;
  }
}
