import { Gabliam } from '@gabliam/core';
import * as e from 'express';
import * as path from 'path';
import { METADATA_KEY } from '@gabliam/core/lib/constants';
import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import ExpressPlugin, { APP } from '../src/index';

export class ExpressPluginTest {
  public gab: Gabliam;
  public app: e.Application;

  constructor() {
    this.gab = new Gabliam({
      scanPath: path.resolve(__dirname, './decorators/__snapshots__'),
      configPath: path.resolve(__dirname, './decorators/__snapshots__')
    }).addPlugin(ExpressPlugin);
  }

  async start() {
    await this.gab.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }

  async destroy() {
    await this.gab.destroy();
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
