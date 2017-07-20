export class AmqpTimeout extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AmqpTimeout.prototype);
  }
}
