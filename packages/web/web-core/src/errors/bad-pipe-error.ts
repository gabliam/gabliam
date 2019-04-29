/**
 * Exception when Pipe not implement Pipe
 */
export class BadPipeError extends Error {
  name = 'BadPipeError';

  constructor(pipe: Function) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BadPipeError.prototype);

    const name = pipe.constructor ? pipe.constructor.name : pipe;

    // tslint:disable-next-line:max-line-length
    this.message = `${name} must implement Pipe interface`;
  }
}
