import * as yaml from 'js-yaml';
import { ParserNotSupportedError } from '../../errors';

export type Parser = (data: string) => Promise<any>;

export const getParser = (parserName: string) => {
  switch (parserName) {
    case 'yml':
    case 'yaml':
      return ymlParser;
    case 'json':
      return jsonParser;
    default:
      throw new ParserNotSupportedError(parserName);
  }
};

const jsonParser: Parser = (data: string) => {
  return Promise.resolve(JSON.parse(data));
};

const ymlParser: Parser = (data: string) => {
  return Promise.resolve(yaml.load(data) || {});
};
