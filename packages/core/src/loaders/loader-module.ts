import * as glob from 'glob';
import * as _ from 'lodash';
import * as d from 'debug';

import { Registry } from '../registry';
import { METADATA_KEY } from '../constants';
import { RegistryMetada, GabliamPlugin } from '../interfaces';
import { isObject } from '../utils';

const debug = d('Gabliam:loader');
const reg = /^.*(git|svn|node_modules|dist|build).*/;

/**
 * Loader
 */
export class LoaderModule {
  /**
   * List of loaded folder
   */
  private loadedFolder: string[] = [];

  /**
   * Load all modules
   * @param  {string} scan
   * @param  {GabliamPlugin[]} plugins
   */
  load(scan: string, plugins: GabliamPlugin[]) {
    const folders = plugins.reduce(
      (prev, current) => {
        if (
          isObject(current) &&
          current.constructor &&
          Reflect.hasOwnMetadata(METADATA_KEY.scan, current.constructor)
        ) {
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
        if (isObject(m) && Reflect.hasOwnMetadata(METADATA_KEY.register, m)) {
          const metadata = <RegistryMetada>Reflect.getOwnMetadata(
            METADATA_KEY.register,
            m
          );
          registry.add(metadata.type, metadata.value);
        }

        if (isObject(m) && Reflect.hasOwnMetadata(METADATA_KEY.scan, m)) {
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

    /* istanbul ignore if  */
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
}
