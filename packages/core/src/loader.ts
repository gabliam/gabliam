import * as glob from 'glob';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as d from 'debug';

import { Registry } from './registry';
import { hasMetadata } from './decorators';
import { METADATA_KEY } from './constants';
import { RegistryMetada, GabliamPlugin } from './interfaces';

const debug = d('Gabliam:loader');
const reg = /^.*(git|svn|node_modules|dist|build).*/;

/**
 * Loader
 */
export class Loader {
  /**
   * List of loaded folder
   */
  private loadedFolder: string[] = [];

  /**
   * Load all modules
   * @param  {string} scan
   * @param  {GabliamPlugin[]} plugins
   */
  loadModules(scan: string, plugins: GabliamPlugin[]) {
    const folders = plugins.reduce(
      (prev, current) => {
        if (hasMetadata(METADATA_KEY.scan, current.constructor)) {
          const paths = <string[]>Reflect.getOwnMetadata(
            METADATA_KEY.scan,
            current.constructor
          );
          prev.push(...paths);
        }
        return prev;
      },
      [scan]
    );
    debug('folders to load', folders);
    return this.loadFolders(...folders);
  }

  /**
   * Load on folder
   * @param  {string} folder
   */
  private loadFolder(folder: string) {
    debug(`load ${folder}`);

    const registry = new Registry();

    const files = glob
      .sync('**/*.@(js|ts)', { cwd: folder })
      .filter(file => !_.endsWith(file, '.d.ts') && !reg.test(file))
      .map(file => `${folder}/${file}`);

    for (const file of files) {
      const modules = require(file);
      for (const k of Object.keys(modules)) {
        const m = modules[k];
        if (hasMetadata(METADATA_KEY.register, m)) {
          const metadata = <RegistryMetada>Reflect.getOwnMetadata(
            METADATA_KEY.register,
            m
          );
          registry.add(metadata.type, metadata.value);
        }
        // if ()
        if (hasMetadata(METADATA_KEY.scan, m)) {
          const paths = <string[]>Reflect.getOwnMetadata(METADATA_KEY.scan, m);
          registry.addRegistry(this.loadFolders(...paths));
        }
      }
    }

    return registry;
  }

  /**
   * Load folders
   * @param  {string[]} ...folders
   */
  private loadFolders(...folders: string[]) {
    const registry = new Registry();

    if (!Array.isArray(folders) || folders.length === 0) {
      return registry;
    }

    for (const folder of folders) {
      if (this.loadedFolder.indexOf(folder) === -1) {
        this.loadedFolder.push(folder);
        registry.addRegistry(this.loadFolder(folder));
      }
    }
    return registry;
  }

  /**
   * Load configuration
   * @param  {string} folder the configuration folder
   * @returns any
   */
  loadConfig(folder: string): any {
    debug('loadConfig', folder);
    const files = glob.sync('**/application?(-+([a-zA-Z])).yml', {
      cwd: folder
    });
    let config = {};
    if (!files) {
      return config;
    }

    const profile = process.env.PROFILE || null;
    const defaultProfileFile = files.find(file => file === 'application.yml');

    if (defaultProfileFile) {
      config = this.loadYmlFile(`${folder}/${defaultProfileFile}`);
    }

    if (profile) {
      const profileFile = files.find(
        file => file === `application-${profile}.yml`
      );

      if (profileFile) {
        config = _.merge(
          {},
          config,
          this.loadYmlFile(`${folder}/${profileFile}`)
        );
      }
    }
    debug('loadConfig', config);
    return config;
  }

  private loadYmlFile(ymlPath: string) {
    const data = fs.readFileSync(ymlPath, 'utf8');
    try {
      return yaml.load(data) || {};
    } catch (e) {
      return {};
    }
  }
}
