import { GabliamConfig } from './interfaces';
import * as _ from 'lodash';

const DEFAULT_CONFIG: GabliamConfig = {
  config: process.env.GABLIAM_CONFIG_PATH,
};

export const getGabliamConfig = (
  options?: Partial<GabliamConfig> | string
): GabliamConfig => {
  if (options === undefined) {
    return DEFAULT_CONFIG;
  } else {
    if (_.isString(options)) {
      return {
        ...DEFAULT_CONFIG,
        config: options,
      };
    } else {
      return {
        ...DEFAULT_CONFIG,
        ...options,
      };
    }
  }
};
