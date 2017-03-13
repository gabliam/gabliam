import * as mongoose from 'mongoose';
import { Repository } from './repository';
import { METADATA_KEY } from './constants';
import { DocumentMetadata } from './interfaces';
const { Mongoose } = mongoose;

(<any>mongoose).Promise = global.Promise;

export class MongooseConnection {
    public conn: mongoose.Connection;

    private repositories = new Map<string, Repository<any>>();

    private schemas = new Map<string, mongoose.Model<any>>();

    constructor(uri: string, options: mongoose.ConnectionOptions, listDocument: any[]) {
        let m = new Mongoose();
        this.conn = m.createConnection(uri, options);
        for (let document of listDocument) {
            let { collectionName, name, schema } = <DocumentMetadata>Reflect.getOwnMetadata(METADATA_KEY.document, document);
            let documentName = name.toLowerCase();
            let clazzSchema = this.conn.model<mongoose.Document>(name, schema, collectionName);
            this.schemas.set(documentName, clazzSchema);
        }
    }

    getRepository<T>(documentName: string): Repository<T>;
    getRepository<T>(clazz: any): Repository<T> {
        if (typeof clazz === 'string') {
            return this.getRepositoryByName<T>(clazz);
        }

        let { collectionName, name, schema } = <DocumentMetadata>Reflect.getOwnMetadata(METADATA_KEY.document, clazz);
        let documentName = name.toLowerCase();
        if (this.repositories.has(documentName)) {
            return this.repositories.get(documentName);
        }

        let clazzSchema = this.conn.model<T & mongoose.Document>(name, schema, collectionName);
        let repository = new Repository<T>(clazzSchema);
        this.repositories.set(documentName, repository);
        return repository;
    }

    private getRepositoryByName<T>(documentName: string) {
        let name = documentName.toLowerCase();
        if (this.repositories.has(name)) {
            return this.repositories.get(name);
        } else {
            if (this.schemas.has(name)) {
                let repository = new Repository<T>(this.schemas.get(name));
                this.repositories.set(name, repository);
                return repository;
            }
            throw new Error(`Unknown repository ${name}`);
        }
    }
}
