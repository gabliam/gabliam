/**
 * Exception when an invalid option is passed to `@Plugin`
 */
export class InvalidPluginDecoratorError extends Error {
  name = 'InvalidPluginDecoratorError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidPluginDecoratorError.prototype);

    this.message = `Options of @Plugin decorator must be a string or a PluginOptions.`;
  }
}
