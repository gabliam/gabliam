import { METADATA_KEY } from '../constants';
import { ValueMetadata, ValueValidator } from '../interfaces';
import * as Joi from 'joi';



export interface ValueOptions {
    path: string;
    validator?: Joi.Schema | ValueValidator;
}

function isValueOptions(obj: any): obj is ValueOptions {
    return typeof obj === 'object' && obj.path;
}

function isValueValidator(obj: any): obj is ValueValidator {
    return typeof obj === 'object' && obj.schema;
}

export function Value(options: ValueOptions);
export function Value(path: string, schema?: Joi.Schema);
export function Value(value: any, schema: Joi.Schema = null) {
    return function (target: any, key: string) {
        if (typeof value === 'string') {
            valueProperty(value, schema, target, key);
        } else if (isValueOptions(value)) {
            valueProperty(value.path, value.validator, target, key);
        }
    };
}

function valueProperty(path: string, schema: Joi.Schema | ValueValidator, target: any, key: string) {
    let validator: ValueValidator = null;
    if (schema !== null) {
        if (isValueValidator(schema)) {
            validator = {
                throwError: true,
                ...schema
            };
        } else {
            validator = { throwError: true, schema };
        }
    }
    let metadata: ValueMetadata = { path, target, key, validator };
    let metadataList: ValueMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.value, target.constructor)) {
        Reflect.defineMetadata(METADATA_KEY.value, metadataList, target.constructor);
    } else {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.value, target.constructor);
    }

    metadataList.push(metadata);
}
