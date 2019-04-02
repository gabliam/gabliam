import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import ExpressPlugin, { express as e } from '@gabliam/express';
import { APP } from '@gabliam/web-core';
import ValidatePlugin from '../';

export class ExpressPluginTest extends GabliamTest {
  public app: e.Application;

  constructor() {
    const gab = new Gabliam().addPlugins(ExpressPlugin, ValidatePlugin);
    super(gab);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }
}
