import * as yaml from 'js-yaml';
export type Parser = (data: string) => any;

export const jsonParser: Parser = (data: string) => {
  return JSON.parse(data);
};

export const ymlParser: Parser = (data: string) => {
  return yaml.load(data) || {};
};
