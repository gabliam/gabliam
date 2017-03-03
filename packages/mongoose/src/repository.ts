import * as mongoose from 'mongoose';
import { IRead, IWrite } from './interfaces';

export class RepositoryBase<T> implements IRead<T & mongoose.Document>, IWrite<T, T & mongoose.Document> {

  public model: mongoose.Model<mongoose.Document>;

  constructor(schemaModel: mongoose.Model<mongoose.Document>) {
    this.model = schemaModel;
  }

  create(item: T): Promise<T & mongoose.Document> {
    return this.model.create(item);
  }

  retrieve(): Promise<(T & mongoose.Document)[]> {
    return this.model.find({}).exec();
  }

  update(_id: mongoose.Types.ObjectId, item: T): Promise<T & mongoose.Document> {
    return this.model.update({ _id: _id }, item).exec();
  }

  delete(_id: string): Promise<void> {
    return this.model.remove({ _id: this.toObjectId(_id) }).exec();
  }

  findById(_id: string): Promise<T & mongoose.Document> {
    return this.model.findById(_id).exec();
  }

  findOne(cond?: Object): mongoose.Query<T & mongoose.Document> {
    return this.model.findOne(cond);
  }

  find(cond?: Object, fields?: Object, options?: Object): mongoose.Query<(T & mongoose.Document)[]> {
    return this.model.find(cond, options);
  }

  private toObjectId(_id: string): mongoose.Types.ObjectId {
    return mongoose.Types.ObjectId.createFromHexString(_id);
  }
}