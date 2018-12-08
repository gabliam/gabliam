import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import { APP } from '@gabliam/web-core';
import ExpressPlugin, { express as e } from '../src/index';

export class ExpressPluginTest extends GabliamTest {
  public app: e.Application;

  constructor() {
    const gab = new Gabliam().addPlugin(ExpressPlugin);
    super(gab);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }
}
