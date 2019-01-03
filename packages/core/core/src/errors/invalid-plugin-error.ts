/**
 * Exception when a plugin is passed to gabliam and this plugin does not have a `@Plugin`
 * decorator
 */
export class InvalidPluginError extends Error {
  name = 'InvalidPluginError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidPluginError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `Plugin must be decorated with @Plugin`;
  }
}
