import { IRead, IWrite } from './interfaces';
import { mongoose } from './mongoose';

export class Repository<T>
  implements IRead<T & mongoose.Document>, IWrite<T, T & mongoose.Document> {
  public model: mongoose.Model<T & mongoose.Document>;

  constructor(schemaModel: mongoose.Model<T & mongoose.Document>) {
    this.model = schemaModel;
  }

  create(item: T): Promise<T & mongoose.Document> {
    return this.model.create(<any>item);
  }

  findAll(): Promise<(T & mongoose.Document)[]> {
    return this.model.find({}).exec();
  }

  update(_id: string | mongoose.Types.ObjectId, item: Object): Promise<any> {
    return this.model
      .updateOne(<any>{ _id: this.toObjectId(_id) }, <any>item)
      .exec();
  }

  delete(_id: string | mongoose.Types.ObjectId): Promise<void> {
    return (this.model
      .deleteOne(<any>{ _id: this.toObjectId(_id) })
      .exec() as unknown) as Promise<void>;
  }

  findById(_id: string): Promise<(T & mongoose.Document) | null> {
    return this.model.findById(_id).exec();
  }

  findOne(cond?: Object): mongoose.Query<(T & mongoose.Document) | null> {
    return this.model.findOne(<any>cond);
  }

  find(
    conditions: Object,
    projection?: Object,
    options?: Object,
  ): mongoose.Query<(T & mongoose.Document)[]> {
    return this.model.find(<any>conditions, projection!, options!);
  }

  deleteAll() {
    return this.model.deleteMany({}).exec();
  }

  private toObjectId(
    _id: string | mongoose.Types.ObjectId,
  ): mongoose.Types.ObjectId {
    if (mongoose.Types.ObjectId.isValid(_id)) {
      return <mongoose.Types.ObjectId>_id;
    }

    /* istanbul ignore next */
    return mongoose.Types.ObjectId.createFromHexString(<string>_id);
  }
}
