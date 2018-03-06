import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as d from 'debug';
import { promisify } from 'util';
import { ParserNotSupportedError } from '../errors';
import { configResolver, Resolver } from './config-resolver';

// Promisify
const glob = promisify(require('glob')); // require and no import for typings bug
const readFile = promisify(fs.readFile);

const debug = d('Gabliam:FileLoader');

/**
 * FileLoader
 */
export default async function FileLoader(
  { folder, types }: { folder: string; types?: string[] },
  profile?: string
) {
  /**
   * If no type is present we load just yml
   */
  if (!types) {
    types = ['yml'];
  }

  debug('loadConfig', folder);
  const resolver = configResolver(folder);

  const files: string[] = await glob(
    `**/application?(-+([a-zA-Z])).@(${types.join('|')})`,
    {
      cwd: folder
    }
  );

  let config: Object = {};

  if (!files || files.length === 0) {
    return config;
  }

  for (const type of types) {
    const defaultProfileFile = files.find(
      file => file === `application.${type}`
    );
    if (defaultProfileFile) {
      config = _.merge(
        {},
        config,
        await loadFile(type, `${folder}/${defaultProfileFile}`, resolver)
      );
    }

    if (profile) {
      const profileFile = files.find(
        file => file === `application-${profile}.${type}`
      );

      if (profileFile) {
        config = _.merge(
          {},
          config,
          await loadFile(type, `${folder}/${profileFile}`, resolver)
        );
      }
    }
  }

  return config;
}

async function loadFile(
  parserName: string,
  filePath: string,
  resolver: Resolver
): Promise<Object> {
  const data = await readFile(filePath, 'utf8');
  let config = {};
  switch (parserName) {
    case 'yml':
    case 'yaml':
      config = ymlParser(data);
      break;
    case 'json':
      config = jsonParser(data);
      break;
    default:
      throw new ParserNotSupportedError(parserName);
  }

  return await resolver(config);
}

function jsonParser(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function ymlParser(data: string) {
  try {
    return yaml.load(data) || {};
  } catch (e) {
    return {};
  }
}
