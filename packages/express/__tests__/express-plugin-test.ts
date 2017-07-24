import { Gabliam } from '@gabliam/core';
import * as e from 'express';
import * as path from 'path';
import { METADATA_KEY } from '@gabliam/core/lib/constants';
import { Loader as CoreLoader } from '@gabliam/core/lib/loader';
import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import ExpressPlugin, { APP } from '../src/index';
import * as _ from 'lodash';

export class Loader extends CoreLoader {
  conf = {};

  addConfig(p: string, conf: any) {
    this.conf = _.set(this.conf, p, conf);
  }

  loadConfig(folder: string, profile?: string | null): any {
    const config = super.loadConfig(folder, profile);
    return _.merge({}, config, this.conf);
  }
}

export class ExpressPluginTest {
  public gab: Gabliam;
  public app: e.Application;

  public loader: Loader;

  constructor() {
    this.gab = new Gabliam({
      scanPath: path.resolve(__dirname, './decorators/__snapshots__'),
      configPath: path.resolve(__dirname, './decorators/__snapshots__')
    }).addPlugin(ExpressPlugin);
    this.loader = (<any>this.gab)._loader = new Loader();
  }

  async start() {
    await this.gab.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }

  async destroy() {
    await this.gab.destroy();
  }

  addConf(p: string, conf: any) {
    this.loader.addConfig(p, conf);
  }

  addClass(ctrl: any) {
    if (Reflect.hasOwnMetadata(METADATA_KEY.register, ctrl)) {
      const metadata = <RegistryMetada>Reflect.getOwnMetadata(
        METADATA_KEY.register,
        ctrl
      );
      this.gab.registry.add(metadata.type, metadata.value);
    }
    return this;
  }
}
