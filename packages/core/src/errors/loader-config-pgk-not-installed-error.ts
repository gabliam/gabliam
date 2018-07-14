/**
 * Exception when loader config has not been found installed
 */
export class LoaderConfigPgkNotInstalledError extends Error {
  name = 'LoaderConfigPgkNotInstalledError';

  constructor(loaderName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LoaderConfigPgkNotInstalledError.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `${loaderName} package has not been found installed. Try to install it: npm install ${loaderName} --save or yarn add ${loaderName}`;
  }
}
