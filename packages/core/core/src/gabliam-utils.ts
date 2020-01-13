import * as bluebird from 'bluebird';
import * as g from 'glob';
import { toPromise, Type } from './common';
import { TYPE } from './constants';
import { Gabliam } from './gabliam';
import { ValueRegistry } from './interfaces';
import { LoaderModule } from './loaders';
import { Application } from './metadatas';
import { reflection } from './reflection';
import { Registry } from './registry';
import { promisify } from 'util';
import * as _ from 'lodash';
const glob = promisify(g);

const reg = /^.*(git|svn|node_modules|dist|build).*/;

/**
 * Search gabliam app and return array of valueregistry
 */
export const gabliamFinder = async (scanPath: string) => {
  const loaderModule = new LoaderModule();
  const registry = new Registry();
  registry.addRegistry(loaderModule.load(scanPath, []));
  return registry.get(TYPE.Application);
};

/**
 * Find gabliam application and return the class
 * @param scanPath path to scan
 * @param appName name of the application (if many)
 */
export const gabliamFindApp = async (scanPath: string, appName?: string) => {
  const list = await gabliamFinder(scanPath);
  let app: Type<any> | undefined;
  if (appName) {
    for (const value of list) {
      const metadata = reflection.annotationsOfDecorator<Application>(
        value.target,
        Application
      )[0];

      if (metadata) {
        const name = metadata.name ?? value.target.name;
        if (appName === name) {
          app = value.target;
          break;
        }
      }
    }
  } else {
    if (list.length > 1) {
      throw new Error(
        `Too many app (${list.length}) found. You must select an application.`
      );
    }

    if (list[0]) {
      app = list[0].target;
    }
  }

  if (app === undefined) {
    const errorMsg = appName
      ? `${appName} is not a gabliam application`
      : 'no application found';
    throw new Error(errorMsg);
  }

  return app;
};

const isValueRegistry = (val: any): val is ValueRegistry<any> => {
  return (
    val &&
    typeof val === 'object' &&
    val.hasOwnProperty('id') &&
    val.hasOwnProperty('target') &&
    val.hasOwnProperty('autoBind')
  );
};

/**
 * Build a gabliam app
 * @param clazzOrValue  ValueRegistry or class of application
 */
export const gabliamBuilder = async <T = any>(
  clazzOrValue: ValueRegistry<T> | Type<any>
) => {
  let clazz: any = clazzOrValue;
  if (isValueRegistry(clazzOrValue)) {
    clazz = clazzOrValue.target;
  }

  const application = reflection.annotationsOfDecorator<Application>(
    clazz,
    Application
  )[0];
  if (application) {
    const plugins = await bluebird
      .filter(application.plugins, async item => toPromise(item.condition()))
      .map(item => {
        if (typeof item.plugin === 'string') {
          return require(item.plugin).default;
        }
        return item.plugin;
      });
    return new Gabliam(application.gabliamConfig).addPlugins(...plugins);
  }

  throw new Error(`${clazzOrValue} is not a gabliam application`);
};

export const setupTsProject = async (folder: string) => {
  const files = await bluebird.filter(
    glob('{*.@(|ts),!(git|svn|node_modules|dist|build)/**/*.@(ts)}', {
      cwd: folder,
    }),
    file => !_.endsWith(file, '.d.ts') && !reg.test(file)
  );
  if (files.length > 0) {
    console.log('Typescript project detected. Add ts-node');
    const tsnode = require('ts-node');
    tsnode.register({
      dir: process.cwd(),
    });
    module.require('tsconfig-paths/register');
  }
};
