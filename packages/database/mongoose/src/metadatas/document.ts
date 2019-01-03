import { makeDecorator, Register } from '@gabliam/core';
import { METADATA_KEY, TYPE } from '../constants';
import { mongoose } from '../mongoose';
import {
  MongoSchemaIsMandatoryError,
  MongoSchemaInstanceError,
} from '../errors';

export interface DocumentOptions {
  name: string;
  collectionName?: string;
  schema?: mongoose.Schema;
}

/**
 * Type of the `Document` decorator / constructor function.
 */
export interface DocumentDecorator {
  /**
   * Decorator that marks a class to be a Mongo Document.
   *
   * The schema can be a static method or in decorator options
   *
   * @usageNotes
   *
   * Example with static method
   *
   * ```typescript
   * @Document('Hero')
   * export class Hero {
   *   static getSchema() {
   *     const schema = new mongoose.Schema({
   *       name: {
   *         type: String,
   *         required: true,
   *       },
   *       power: {
   *         type: String,
   *         required: true,
   *       },
   *       amountPeopleSaved: {
   *         type: Number,
   *         required: false,
   *       },
   *       createdAt: {
   *         type: Date,
   *         required: false,
   *       },
   *       modifiedAt: {
   *         type: Date,
   *         required: false,
   *       },
   *     });
   *
   *     schema.pre('save', <any>function(this: HeroModel, next: any) {
   *       if (this) {
   *         const now = new Date();
   *         if (!this.createdAt) {
   *           this.createdAt = now;
   *         }
   *         this.modifiedAt = now;
   *       }
   *       next();
   *     });
   *
   *     return schema;
   *   }
   * }
   * ```
   *
   */
  (value: string | DocumentOptions): ClassDecorator;

  /**
   * see the `@Document` decorator.
   */
  new (value: string | DocumentOptions): any;
}

/**
 * Type of metadata for an `Document` property.
 */
export interface Document {
  name: string;
  collectionName?: string;
  schema: mongoose.Schema;
}

type OptionnalOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  { [K in Keys]+?: Partial<Pick<T, K>> }[Keys];

export const Document: DocumentDecorator = makeDecorator(
  METADATA_KEY.document,
  (value: string | DocumentOptions): OptionnalOne<Document, 'schema'> => {
    let opts: DocumentOptions;
    if (typeof value === 'string') {
      opts = {
        name: value,
      };
    } else {
      opts = value;
    }

    const schema = opts.schema;

    return {
      ...opts,
      schema,
    };
  },
  (cls: any, annotationInstance: Document) => {
    let schema = annotationInstance.schema;
    if (!annotationInstance.schema) {
      if (typeof cls.getSchema !== 'function') {
        throw new MongoSchemaIsMandatoryError();
      }
      schema = annotationInstance.schema = cls.getSchema();
    }

    if (!(schema instanceof mongoose.Schema)) {
      throw new MongoSchemaInstanceError();
    }
    Register({ type: TYPE.Document, id: cls })(cls);
  }
);
