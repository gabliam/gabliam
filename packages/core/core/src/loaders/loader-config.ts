import * as _ from 'lodash';
import * as d from 'debug';
import FileLoader from './file-loader';
import { LoaderConfigPgkNotInstalledError } from '../errors';

const debug = d('Gabliam:loader-config');

export type Loader = (options: any, profile?: string) => Promise<Object>;

export interface LoaderConfigOptions {
  /**
   * The loader
   * if string, require the loader
   */
  loader: string | Loader;

  /**
   * options passed on loader
   */
  options?: Object;
}

/**
 * Class that load config
 *
 * By default if there is no loaderConfigOptions, use FileLoader
 */
export class LoaderConfig {
  /**
   * Load configuration
   */
  async load(
    configOptions: string | LoaderConfigOptions[] | undefined,
    profile = process.env.PROFILE || undefined
  ): Promise<any> {
    debug('load', configOptions);

    if (configOptions === undefined) {
      return {};
    }

    let loaderConfigOptions: LoaderConfigOptions[];

    // If configOptions is a string, create the default loaderconfig
    if (typeof configOptions === 'string') {
      loaderConfigOptions = [
        {
          loader: FileLoader,
          options: {
            folder: configOptions,
          },
        },
      ];
    } else {
      loaderConfigOptions = configOptions;
    }
    debug('loaderConfigOptions', { loaderConfigOptions });
    let config = {};

    for (const { loader, options } of loaderConfigOptions) {
      let loaderFunc: Loader;

      if (typeof loader === 'string') {
        try {
          loaderFunc = require(loader).default;
        } catch {
          throw new LoaderConfigPgkNotInstalledError(loader);
        }
      } else {
        loaderFunc = loader;
      }
      debug('loaderFunc', { loaderFunc });
      const loadedConfig = await loaderFunc(options, profile);

      config = _.merge({}, config, loadedConfig);
    }

    debug('loadConfig', config);
    return config;
  }
}
