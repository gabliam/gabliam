/**
 * Exception when a plugin is passed to gabliam and this plugin doest have a `@Plugin`
 * decorator
 */
export class PluginDependencyIsMissingError extends Error {
  name = 'PluginDependencyIsMissingError';

  constructor(pluginName: string, dependencyName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PluginDependencyIsMissingError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `The plugin ${pluginName} need the plugin ${dependencyName}. Try to install it: npm install ${dependencyName} --save or yarn add ${dependencyName}`;
  }
}
