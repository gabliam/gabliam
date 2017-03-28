import * as mongoose from 'mongoose';

export interface DocumentOptions  {
  name: string;
  collectionName?: string;
  schema?: mongoose.Schema;
}

export interface IRead<T extends mongoose.Document> {
  findAll(): Promise<T[]>;
  findById(_id: string): Promise<T>;
  findOne(cond?: Object): mongoose.Query<T>;
  find(cond?: Object, fields?: Object, options?: Object): mongoose.Query<T[]>;
}

export interface IWrite<T, U extends mongoose.Document> {
  create(item: T): Promise<U>;
  update(_id: mongoose.Types.ObjectId, item: T): Promise<U>;
  delete(_id: string): Promise<void>;
}

export interface MongooseConfiguration {
  uri?: string;

  host?: string;

  database_name?: string;

  port?: number;

  options: mongoose.ConnectionOptions;
}
