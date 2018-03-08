import { Config, Gabliam } from '@gabliam/core';
import * as sinon from 'sinon';
import { KoaPlugin } from '../src/koa-plugin';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as path from 'path';

describe('test plugin', async () => {
  const build = sinon.spy(KoaPlugin.prototype, 'build');
  const bind = sinon.spy(KoaPlugin.prototype, 'bind');
  const config = sinon.spy(KoaPlugin.prototype, 'config');
  const start = sinon.spy(KoaPlugin.prototype, 'start');
  const stop = sinon.spy(KoaPlugin.prototype, 'stop');
  const destroy = sinon.spy(KoaPlugin.prototype, 'destroy');
  let gab: Gabliam;

  describe('with config', () => {
    beforeAll(() => {
      const g = new GabliamTest(new Gabliam().addPlugin(KoaPlugin));
      gab = g.gab;

      @Config()
      class Conf {}
      g.addClass(Conf);
    });

    afterAll(() => {
      build.resetHistory();
      bind.resetHistory();
      config.resetHistory();
      start.resetHistory();
      stop.resetHistory();
      destroy.resetHistory();
    });

    test('gabliam build', async () => {
      await gab.build();
      expect(build.calledOnce).toBe(true);
      expect(bind.calledOnce).toBe(true);
      expect(config.callCount).toMatchSnapshot();
    });

    test('gabliam start', async () => {
      await gab.start();
      expect(start.calledOnce).toBe(true);
    });

    test('gabliam stop', async () => {
      await gab.stop();
      expect(stop.calledOnce).toBe(true);
    });

    test('gabliam destroy', async () => {
      await gab.destroy();
      expect(destroy.calledOnce).toBe(true);
    });
  });

  describe('without config', () => {
    beforeAll(() => {
      gab = new Gabliam({
        scanPath: path.resolve(__dirname, './fixtures/gabliam'),
        config: path.resolve(__dirname, './fixtures/gabliam/config')
      });
      gab.addPlugin(KoaPlugin);
    });

    afterAll(() => {
      build.resetHistory();
      bind.resetHistory();
      config.resetHistory();
      start.resetHistory();
      stop.resetHistory();
      destroy.resetHistory();
    });

    test('gabliam build', async () => {
      await gab.build();
      expect(build.calledOnce).toBe(true);
      expect(bind.calledOnce).toBe(true);
      expect(config.calledOnce).toBe(true);
    });

    test('gabliam start', async () => {
      await gab.start();
      expect(start.calledOnce).toBe(true);
    });

    test('gabliam stop', async () => {
      await gab.stop();
      expect(stop.calledOnce).toBe(true);
    });

    test('gabliam destroy', async () => {
      await gab.destroy();
      expect(destroy.calledOnce).toBe(true);
    });
  });
});
