export class ClassIsNotAMongoDocument extends Error {
  name = 'ClassIsNotAMongoDocument';

  constructor(cls: any) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ClassIsNotAMongoDocument.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = `${
      cls.name
    } is not a mongo document. You must add '@Document' decorator on you entity`;
  }
}
