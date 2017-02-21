import { interfaces, Container } from 'inversify';
import { METADATA_KEY, APP_CONFIG } from '../constants';
import { ValueMetadata } from '../interfaces';
import * as _ from 'lodash';

export function makeValueMiddleware(container: Container) {
    return function ValueMiddleware(next: interfaces.Next): interfaces.Next {
        return (args: interfaces.NextArgs) => {
            let results: any = null;
            results = next(args);
            let valueMetadata: ValueMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.value,
                results.constructor
            );

            if (valueMetadata) {
                valueMetadata.forEach(({key, path}) => {
                    let defaultValue = results[key];
                    let config = container.get(APP_CONFIG);
                    results[key] = _.get(config, path, defaultValue);
                });
            }

            return results;
        };
    }
}