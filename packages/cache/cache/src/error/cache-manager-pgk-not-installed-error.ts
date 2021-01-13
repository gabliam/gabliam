export class CacheManagerPgkNotInstalledError extends Error {
  name = 'CacheManagerPgkNotInstalledError';

  constructor(Cachename: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CacheManagerPgkNotInstalledError.prototype);

    this.message = ` CacheManager "${Cachename}" package has not been found installed. Try to install it: npm install ${Cachename} --save or yarn add ${Cachename}`;
  }
}
