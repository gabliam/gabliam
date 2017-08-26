import { register } from '@gabliam/core';
import { TYPE, METADATA_KEY } from '../constants';
import { DocumentOptions, DocumentMetadata } from '../interfaces';
import * as mongoose from 'mongoose';

export function Document(v: string | DocumentOptions) {
  return function(target: any) {
    let opts: DocumentOptions;
    if (typeof v === 'string') {
      opts = {
        name: v
      };
    } else {
      opts = v;
    }

    let schema: mongoose.Schema;
    if (!opts.schema) {
      if (typeof target.getSchema !== 'function') {
        throw new Error(
          `Schema is mandory. Add it with decorator or with static method`
        );
      }
      schema = target.getSchema();
    } else {
      schema = opts.schema;
    }

    if (!(schema instanceof mongoose.Schema)) {
      throw new Error(`Schema must be an instance of mongoose.Schema`);
    }

    const metadata: DocumentMetadata = {
      ...opts,
      schema
    };

    Reflect.defineMetadata(METADATA_KEY.document, metadata, target);
    register(TYPE.Document, { id: null, target })(target);
  };
}
