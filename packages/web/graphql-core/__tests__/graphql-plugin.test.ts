import { Config, Gabliam } from '@gabliam/core';
import * as sinon from 'sinon';
import { GabliamTest } from '@gabliam/core/src/testing';
import ExpressPlugin from '@gabliam/express';
import * as path from 'path';
import { GraphqlPlugin } from './graphql-plugin';

const build = sinon.spy(GraphqlPlugin.prototype, 'build');
let gab: Gabliam;

describe('with config', () => {
  beforeAll(() => {
    const g = new GabliamTest(
      new Gabliam({ scanPath: path.resolve(__dirname, './fixtures') })
        .addPlugin(ExpressPlugin)
        .addPlugin(GraphqlPlugin),
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
    gab = new Gabliam();
    gab.addPlugin(ExpressPlugin).addPlugin(GraphqlPlugin);
  });

  afterAll(() => {
    build.resetHistory();
  });

  test('gabliam build', async () => {
    await expect(gab.build()).rejects.toMatchSnapshot();
  });
});
