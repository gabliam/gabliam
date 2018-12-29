import * as d from 'debug';
import * as glob from 'glob';
import * as _ from 'lodash';
import { TYPE } from '../../constants';
import { GabliamPlugin, ValueRegistry } from '../../interfaces';
import { PreDestroy, Register, Scan } from '../../metadata';
import { reflection } from '../../reflection';
import { Registry } from '../../registry';
import { isObject } from '../../utils';

const debug = d('Gabliam:loader');
const reg = /^.*(git|svn|node_modules|dist|build).*/;

/**
 * Class that load all module and register all classes
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
  load(scan: string | undefined, plugins: GabliamPlugin[]) {
    const folders = plugins.reduce(
      (prev, current) => {
        if (isObject(current) && current.constructor) {
          const scanMetadatas = reflection.annotationsOfDecorator<Scan>(
            current.constructor,
            Scan
          );
          prev.push(...scanMetadatas.map(s => s.path));
        }
        return prev;
      },
      scan ? [scan] : []
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

      // for all exported
      for (const k of Object.keys(modules)) {
        const m = modules[k];

        const metadatas = reflection.annotationsOfDecorator<Register>(
          m,
          Register
        );
        const scanMetadatas = reflection.annotationsOfDecorator<Scan>(m, Scan);

        // if the module is an objet and has a register metadata => add in registry
        if (metadatas.length) {
          // get the last definition of register metada
          const [metadata] = metadatas.slice(-1);
          registry.add(metadata.type, {
            id: metadata.id || m,
            target: m,
            options: metadata.options,
          });

          const preDestroys = Object.keys(
            reflection.propMetadataOfDecorator(m, PreDestroy)
          );

          // if the module has preDestroy, registry this
          if (preDestroys.length) {
            registry.add(TYPE.PreDestroy, <ValueRegistry>{
              id: m,
              target: m,
              options: {
                preDestroys,
              },
            });
          }
        }

        // if the module is an objet and has a scan metadata => add in registry and load paths
        if (scanMetadatas.length) {
          registry.addRegistry(
            this.loadFolders(...scanMetadatas.map(s => s.path))
          );
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
