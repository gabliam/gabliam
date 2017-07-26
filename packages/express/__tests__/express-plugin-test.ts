import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as e from 'express';
import * as path from 'path';
import ExpressPlugin, { APP } from '../src/index';

export class ExpressPluginTest extends GabliamTest {
  public app: e.Application;

  constructor() {
    const gab = new Gabliam({
      scanPath: path.resolve(__dirname, 'gabliam'),
      configPath: path.resolve(__dirname, 'gabliam')
    }).addPlugin(ExpressPlugin);
    super(gab);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }
}
