export class Deferred<T = any> {
  /* A method to resolve the associated Promise with the value passed.
   * If the promise is already settled it does nothing.
   *
   * @param {anything} value : This value is used to resolve the promise
   * If the value is a Promise then the associated promise assumes the state
   * of Promise passed as value.
   */
  public resolve: (value?: T | PromiseLike<T> | undefined) => void;

  /* A method to reject the assocaited Promise with the value passed.
       * If the promise is already settled it does nothing.
       *
       * @param {anything} reason: The reason for the rejection of the Promise.
       * Generally its an Error object. If however a Promise is passed, then the Promise
       * itself will be the reason for rejection no matter the state of the Promise.
       */
  public reject: (reason?: any) => void;

  public promise: Promise<T>;

  constructor() {
    /* A newly created Pomise object.
       * Initially in pending state.
       */
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
