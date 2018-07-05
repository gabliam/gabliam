import { Repository } from './repository';
import { METADATA_KEY } from './constants';
import { DocumentMetadata, MongooseConfiguration } from './interfaces';
import { mongoose } from './mongoose';
const { Mongoose } = mongoose;
const uriFormat = require('mongodb-uri');

(<any>mongoose).Promise = global.Promise;

/**
 * https://github.com/Automattic/mongoose/blob/master/migrating_to_5.md#required-uri-encoding-of-connection-strings
 */
function encodeMongoURI(urlString: string) {
  if (urlString) {
    const parsed = uriFormat.parse(urlString);

    // add port for all hosts
    if (Array.isArray(parsed.hosts)) {
      parsed.hosts = parsed.hosts.map((h: any) => {
        if (!h.port) {
          h.port = 27017;
        }
        return h;
      });
    }
    urlString = uriFormat.format(parsed);
  }
  return urlString;
}

export class MongooseConnection {
  public name: string;

  public conn: mongoose.Connection;

  private repositories = new Map<string, Repository<any>>();

  private schemas = new Map<string, mongoose.Model<any>>();

  constructor(
    connectionName: string,
    mongooseConfiguration: MongooseConfiguration,
    listDocument: any[]
  ) {
    this.name = connectionName;
    const m = new Mongoose();

    const options: any = {
      ...(mongooseConfiguration.options || {}),
      useNewUrlParser: true
    };

    this.conn = m.createConnection(
      encodeMongoURI(mongooseConfiguration.uri!),
      options
    );

    for (const document of listDocument) {
      const { collectionName, name, schema } = <DocumentMetadata>(
        Reflect.getOwnMetadata(METADATA_KEY.document, document)
      );
      const documentName = name.toLowerCase();
      const clazzSchema = this.conn.model<mongoose.Document>(
        name,
        schema,
        collectionName
      );
      this.schemas.set(documentName, clazzSchema);
    }
  }

  getRepository<T>(clazz: string | any): Repository<T> {
    if (typeof clazz === 'string') {
      return this.getRepositoryByName<T>(clazz);
    }

    const { collectionName, name, schema } = <DocumentMetadata>(
      Reflect.getOwnMetadata(METADATA_KEY.document, clazz)
    );
    const documentName = name.toLowerCase();
    if (this.repositories.has(documentName)) {
      return this.repositories.get(documentName)!;
    }

    const clazzSchema = this.conn.model<T & mongoose.Document>(
      name,
      schema,
      collectionName
    );
    const repository = new Repository<T>(clazzSchema);
    this.repositories.set(documentName, repository);
    return repository;
  }

  private getRepositoryByName<T>(documentName: string) {
    const name = documentName.toLowerCase();
    if (this.repositories.has(name)) {
      return this.repositories.get(name)!;
    } else {
      if (this.schemas.has(name)) {
        const repository = new Repository<T>(this.schemas.get(name)!);
        this.repositories.set(name, repository);
        return repository;
      }
      throw new Error(`Unknown repository ${name}`);
    }
  }
}
