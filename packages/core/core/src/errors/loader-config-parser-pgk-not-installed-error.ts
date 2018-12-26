/**
 * Exception when loader config pkg has not been found installed
 */
export class LoaderConfigParserPgkNotInstalledError extends Error {
  name = 'LoaderConfigParserPgkNotInstalledError';

  constructor(loaderName: string, pkgName: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(
      this,
      LoaderConfigParserPgkNotInstalledError.prototype
    );

    // tslint:disable-next-line:max-line-length
    this.message = `${loaderName} package has not been found installed. Try to install it: npm install ${pkgName} --save or yarn add ${pkgName}`;
  }
}
