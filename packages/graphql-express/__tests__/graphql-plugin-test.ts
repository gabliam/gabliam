import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as e from 'express';
import ExpressPlugin from '@gabliam/express';
import GraphqlPlugin from '../src/index';
import { APP } from '@gabliam/web-core';

export class GraphqlPluginTest extends GabliamTest {
  public app: e.Application;

  constructor() {
    const gab = new Gabliam().addPlugin(ExpressPlugin).addPlugin(GraphqlPlugin);
    super(gab);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<e.Application>(APP);
  }
}
