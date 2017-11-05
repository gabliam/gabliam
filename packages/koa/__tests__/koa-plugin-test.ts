import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as koa from 'koa';
import * as path from 'path';
import KoaPlugin, { APP } from '../src/index';

export class KoaPluginTest extends GabliamTest {
  public app: koa;

  constructor() {
    const gab = new Gabliam({
      scanPath: path.resolve(__dirname, 'gabliam'),
      configPath: path.resolve(__dirname, 'gabliam')
    }).addPlugin(KoaPlugin);
    super(gab);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<koa>(APP);
  }
}
