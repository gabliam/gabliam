import { interfaces, Container } from 'inversify';
import { METADATA_KEY, APP_CONFIG } from '../constants';
import { ValueMetadata, ValueValidator } from '../interfaces';
import { ValueValidationError } from '../errors';
import * as _ from 'lodash';
import * as Joi from 'joi';


/**
 *  Make  the value middleware
 *  Intercept all creation, if the class as a Value decorator then inject the value
 * @param  {Container} container
 */
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
                throw new ValueValidationError(msg, validate.error);
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
                        try {
                            let defaultValue = results[key];
                            let config = container.get<any>(APP_CONFIG);
                            let value = _.get(config, path, defaultValue);
                            if (validator) {
                                value = validate(path, value, validator);
                            }
                            results[key] = value;
                        } catch (err) {
                            if (err instanceof ValueValidationError) {
                                throw err;
                            }
                         }
                    });
                }
            }
            return results;
        };
    };
}
