export class CachePgkNotInstalledError extends Error {
  name = 'CachePgkNotInstalledError';

  constructor(Cachename: string) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CachePgkNotInstalledError.prototype);

    this.message = ` Cache "${Cachename}" package has not been found installed. Try to install it: npm install ${Cachename} --save or yarn add ${Cachename}`;
  }
}
