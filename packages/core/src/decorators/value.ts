import { container } from '../container';
import { APP_CONFIG } from '../constants';
import * as _ from 'lodash';

export function Value(path: string) {
    return function (target, key: string, descriptor: PropertyDescriptor) {
        let val = descriptor.get();
        descriptor.get = () => {
            let config = container.get(APP_CONFIG);
            return _.get(config, path, val);
        }
    }
}