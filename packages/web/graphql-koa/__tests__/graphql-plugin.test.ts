import { Config, Gabliam } from '@gabliam/core';
import * as sinon from 'sinon';
import { GraphqlPlugin } from '../src/graphql-plugin';
import { GabliamTest } from '@gabliam/core/src/testing';
import KoaPlugin from '@gabliam/koa';
import * as path from 'path';

const build = sinon.spy(GraphqlPlugin.prototype, 'build');
let gab: Gabliam;

describe('with config', () => {
  beforeAll(() => {
    const g = new GabliamTest(
      new Gabliam().addPlugin(KoaPlugin).addPlugin(GraphqlPlugin)
    );
    gab = g.gab;

    @Config()
    class Conf {}
    g.addClass(Conf);
  });

  afterAll(() => {
    build.resetHistory();
  });

  test('gabliam build', async () => {
    await gab.build();
    expect(build.calledOnce).toBe(true);
  });
});

describe('without config', () => {
  beforeAll(() => {
    gab = new Gabliam({
      scanPath: path.resolve(__dirname, './fixtures/gabliam'),
      config: path.resolve(__dirname, './fixtures/gabliam/config'),
    });
    gab.addPlugin(KoaPlugin).addPlugin(GraphqlPlugin);
  });

  afterAll(() => {
    build.resetHistory();
  });

  test('gabliam build', async () => {
    await gab.build();
    expect(build.calledOnce).toBe(true);
  });
});
