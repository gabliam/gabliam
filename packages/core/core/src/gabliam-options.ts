import _ from 'lodash';
import { GabliamConfig } from './interfaces';

const DEFAULT_CONFIG: GabliamConfig = {
  config: process.env.GABLIAM_CONFIG_PATH,
};

export const getGabliamConfig = (
  options?: Partial<GabliamConfig> | string,
): GabliamConfig => {
  if (options === undefined) {
    return DEFAULT_CONFIG;
  }
  if (_.isString(options)) {
    return {
      ...DEFAULT_CONFIG,
      config: options,
    };
  }
  return {
    ...DEFAULT_CONFIG,
    ...options,
  };
};
