import * as mongoose from 'mongoose';
import { Repository } from './repository';
import { METADATA_KEY } from './constants';
import { DocumentMetadata, MongooseConfiguration } from './interfaces';
const { Mongoose } = mongoose;

(<any>mongoose).Promise = global.Promise;

export class MongooseConnection {
    public conn: mongoose.Connection;

    private repositories = new Map<string, Repository<any>>();

    private schemas = new Map<string, mongoose.Model<any>>();

    constructor(mongooseConfiguration: MongooseConfiguration, listDocument: any[]) {
        const m = new Mongoose();
        if (mongooseConfiguration.host) {
            this.conn = m.createConnection(
                mongooseConfiguration.host,
                mongooseConfiguration.database_name!, // test by joi
                mongooseConfiguration.port,
                mongooseConfiguration.options
            );
        } else {
            this.conn = m.createConnection(mongooseConfiguration.uri!, mongooseConfiguration.options);
        }

        for (const document of listDocument) {
            const { collectionName, name, schema } = <DocumentMetadata>Reflect.getOwnMetadata(METADATA_KEY.document, document);
            const documentName = name.toLowerCase();
            const clazzSchema = this.conn.model<mongoose.Document>(name, schema, collectionName);
            this.schemas.set(documentName, clazzSchema);
        }
    }

    getRepository<T>(documentName: string): Repository<T> | undefined;
    getRepository<T>(clazz: any): Repository<T> | undefined {
        if (typeof clazz === 'string') {
            return this.getRepositoryByName<T>(clazz);
        }

        const { collectionName, name, schema } = <DocumentMetadata>Reflect.getOwnMetadata(METADATA_KEY.document, clazz);
        const documentName = name.toLowerCase();
        if (this.repositories.has(documentName)) {
            return this.repositories.get(documentName);
        }

        const clazzSchema = this.conn.model<T & mongoose.Document>(name, schema, collectionName);
        const repository = new Repository<T>(clazzSchema);
        this.repositories.set(documentName, repository);
        return repository;
    }

    private getRepositoryByName<T>(documentName: string) {
        const name = documentName.toLowerCase();
        if (this.repositories.has(name)) {
            return this.repositories.get(name);
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
