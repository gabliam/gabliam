import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as e from 'express';
import * as path from 'path';
import ExpressPlugin, { APP } from '@gabliam/express';
import GraphqlPlugin from '../src/index';

export class GraphqlPluginTest extends GabliamTest {
  public app: e.Application;

  constructor(p = path.resolve(__dirname, 'gabliam')) {
    const gab = new Gabliam({
      scanPath: p,
      configPath: p
    })
      .addPlugin(ExpressPlugin)
      .addPlugin(GraphqlPlugin);
    super(gab);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }
}
