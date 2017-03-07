import { interfaces } from 'inversify';
import * as Joi from 'joi';

export interface BeanMetadata {
    id: interfaces.ServiceIdentifier<any>;
    key: string;
    target: any;
}

export interface ValueValidator {
    schema: Joi.Schema;

    throwError?: boolean;

    customErrorMsg?: string;

    options?: Joi.ValidationOptions;
}

export interface ValueMetadata {
    path: string;
    key: string;
    target: any;

    validator: ValueValidator;
}

export interface ValueRegistry {
    id: interfaces.ServiceIdentifier<any>;

    target: any;
}

export interface ConfigRegistry extends ValueRegistry {
    order: number;
}

export interface RegistryMetada {
    type: string|symbol;

    value: ValueRegistry;
}
