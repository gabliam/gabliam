import d from 'debug';
import fs from 'fs';
import _ from 'lodash';
import { promisify } from 'util';
import { LoaderConfigParseError } from '../../errors';
import { configResolver, Resolver } from './config-resolver';
import { getParser } from './parsers';

// Promisify
const glob = promisify(require('glob')); // require and no import for typings bug
const readFile = promisify(fs.readFile);

const debug = d('Gabliam:FileLoader');

/**
 * FileLoader
 */
export async function FileLoader(
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
      cwd: folder,
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
  const parser = getParser(parserName);

  try {
    config = await parser(data);
  } catch (e) {
    throw new LoaderConfigParseError(filePath, e);
  }

  return await resolver(config);
}
