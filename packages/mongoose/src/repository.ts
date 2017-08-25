import * as mongoose from 'mongoose';
import { IRead, IWrite } from './interfaces';

export class Repository<T> implements IRead<T & mongoose.Document>, IWrite<T, T & mongoose.Document> {

  public model: mongoose.Model<T & mongoose.Document>;

  constructor(schemaModel: mongoose.Model<T & mongoose.Document>) {
    this.model = schemaModel;
  }

  create(item: T): Promise<T & mongoose.Document> {
    return this.model.create(item);
  }

  findAll(): Promise<(T & mongoose.Document)[]> {
    return this.model.find({}).exec();
  }

  update(_id: mongoose.Types.ObjectId, item: Object): Promise<any> {
    return this.model.update({ _id: _id }, item).exec();
  }

  delete(_id: string): Promise<void> {
    return this.model.remove({ _id: this.toObjectId(_id) }).exec();
  }

  findById(_id: string): Promise<(T & mongoose.Document | null)> {
    return this.model.findById(_id).exec();
  }

  findOne(cond?: Object): mongoose.Query<(T & mongoose.Document | null)> {
    return this.model.findOne(cond);
  }


  find(conditions: Object, projection?: Object, options?: Object): mongoose.Query<(T & mongoose.Document)[]> {
    return this.model.find(conditions, projection!, options!);
  }

  deleteAll() {
    return this.model.remove({}).exec();
  }

  private toObjectId(_id: string): mongoose.Types.ObjectId {
    return mongoose.Types.ObjectId.createFromHexString(_id);
  }
}
