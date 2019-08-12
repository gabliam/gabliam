import KoaPlugin from '@gabliam/koa';
import { APP } from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import * as koa from 'koa';
import GraphqlPlugin from '../src/index';

export class GraphqlPluginTest extends WebPluginTest {
  public app: koa;

  constructor() {
    super([KoaPlugin, GraphqlPlugin]);
  }

  async build() {
    await super.build();
    this.app = this.gab.container.get<koa>(APP);
    this.app.silent = true;
  }
}
