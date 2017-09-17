import { Config, Gabliam } from '@gabliam/core';
import * as sinon from 'sinon';
import { GraphqlPlugin } from '../src/graphql-plugin';
import { GabliamTest } from '@gabliam/core/lib/testing';
import ExpressPlugin from '@gabliam/express';
import * as path from 'path';

const build = sinon.spy(GraphqlPlugin.prototype, 'build');
const bind = sinon.spy(GraphqlPlugin.prototype, 'bind');
let gab: Gabliam;

describe('with config', () => {
  beforeAll(() => {
    const g = new GabliamTest(
      new Gabliam({
        scanPath: path.resolve(__dirname, 'gabliam'),
        configPath: path.resolve(__dirname, 'gabliam')
      })
        .addPlugin(ExpressPlugin)
        .addPlugin(GraphqlPlugin)
    );
    gab = g.gab;

    @Config()
    class Conf {}
    g.addClass(Conf);
  });

  afterAll(() => {
    build.reset();
    bind.reset();
  });

  test('gabliam build', async () => {
    await gab.build();
    expect(build.calledOnce).toBe(true);
    expect(bind.calledOnce).toBe(true);
  });
});

describe('without config', () => {
  beforeAll(() => {
    gab = new Gabliam({
      scanPath: path.resolve(__dirname, './fixtures/gabliam'),
      configPath: path.resolve(__dirname, './fixtures/gabliam/config')
    });
    gab.addPlugin(ExpressPlugin).addPlugin(GraphqlPlugin);
  });

  afterAll(() => {
    build.reset();
    bind.reset();
  });

  test('gabliam build', async () => {
    await gab.build();
    expect(build.calledOnce).toBe(true);
    expect(bind.calledOnce).toBe(true);
  });
});
