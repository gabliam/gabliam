import * as mongoose from 'mongoose';

export interface DocumentMetadata {
    name: string;
    collectionName?: string;
    schema: mongoose.Schema;
}