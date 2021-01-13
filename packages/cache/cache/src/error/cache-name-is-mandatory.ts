export class CacheNameIsMandatoryError extends Error {
  name = 'CacheNameIsMandatoryError';

  constructor() {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CacheNameIsMandatoryError.prototype);

    this.message = ` Cache name is mandatory. . Add it with @Cacheable or @Cache`;
  }
}
