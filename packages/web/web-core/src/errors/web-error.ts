/**
 * Exception web error
 */
export abstract class WebError extends Error {
  name = 'WebError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, WebError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = 'WebError';
  }

  abstract toJSON(): any;

  abstract toString(): string;

  abstract statusCode(): number;
}
