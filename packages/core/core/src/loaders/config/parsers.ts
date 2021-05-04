import yaml from 'js-yaml';
import {
  LoaderConfigParserPgkNotInstalledError,
  ParserNotSupportedError,
} from '../../errors';

export type Parser = (data: string) => Promise<any>;

const getPropertiesParser = (): Parser => {
  let properties: any;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    properties = require('properties');
  } catch {
    /* istanbul ignore next */
    throw new LoaderConfigParserPgkNotInstalledError(
      'properties',
      'properties',
    );
  }

  return (data: string) =>
    new Promise((resolve, reject) => {
      properties.parse(data, (error: any, res: any) => {
        /* istanbul ignore next */
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
};

const getTomlParser = (): Parser => {
  let toml: any;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    toml = require('@iarna/toml');
  } catch {
    /* istanbul ignore next */
    throw new LoaderConfigParserPgkNotInstalledError(
      '@iarna/toml',
      '@iarna/toml',
    );
  }
  return (data: string) => Promise.resolve(toml.parse(data));
};

const jsonParser: Parser = (data: string) => Promise.resolve(JSON.parse(data));

const ymlParser: Parser = (data: string) =>
  Promise.resolve(yaml.load(data) || {});

export const getParser = (parserName: string) => {
  switch (parserName) {
    case 'yml':
    case 'yaml':
      return ymlParser;
    case 'json':
      return jsonParser;
    case 'toml':
      return getTomlParser();
    case 'properties':
      return getPropertiesParser();
    default:
      throw new ParserNotSupportedError(parserName);
  }
};
