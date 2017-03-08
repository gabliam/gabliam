import { interfaces, Container } from 'inversify';
import { METADATA_KEY, APP_CONFIG } from '../constants';
import { ValueMetadata, ValueValidator } from '../interfaces';
import * as _ from 'lodash';
import * as Joi from 'joi';

export function makeValueMiddleware(container: Container) {
    function validate(path: string, value: any, validator: ValueValidator) {
        let options: Joi.ValidationOptions = {
            abortEarly: false,
            ...(validator.options || {})
        };
        let validate = Joi.validate(value, validator.schema, options);
        if (validate.error) {
            value = null;
            if (validator.throwError) {
                let msg = validator.customErrorMsg || `Error for '${path}' value`;
                msg += JSON.stringify(validate.error);
                throw new Error(msg);
            }
        }
        return validate.value;
    }

    return function ValueMiddleware(next: interfaces.Next): interfaces.Next {
        return (args: interfaces.NextArgs) => {
            let results: any = null;
            results = next(args);

            if (results && results.constructor) {
                let valueMetadata: ValueMetadata[] = Reflect.getOwnMetadata(
                    METADATA_KEY.value,
                    results.constructor
                );

                if (valueMetadata) {
                    valueMetadata.forEach(({ key, path, validator }) => {
                        let defaultValue = results[key];
                        let config = container.get<any>(APP_CONFIG);
                        let value = _.get(config, path, defaultValue);
                        if (validator) {
                            value = validate(path, value, validator);
                        }
                        results[key] = value;
                    });
                }
            }
            return results;
        };
    };
}
