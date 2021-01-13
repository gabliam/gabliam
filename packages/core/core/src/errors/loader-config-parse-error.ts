/**
 * Exception when an error occured on parsing file
 */
export class LoaderConfigParseError extends Error {
  name = 'LoaderConfigParseError';

  constructor(filePath: string, e: Error) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LoaderConfigParseError.prototype);

    this.message = `Error during parsing of file "${filePath}".
    ${e.name}: ${e.message}
    `;
  }
}
