import { Config, Gabliam } from '@gabliam/core';
import sinon from 'sinon';
import { KoaPlugin } from '../src/koa-plugin';
import { GabliamTest } from '@gabliam/core/src/testing';
import path from 'path';

describe('test plugin', () => {
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
      bind.resetHistory();
      config.resetHistory();
      start.resetHistory();
      stop.resetHistory();
      destroy.resetHistory();
    });

    test('gabliam build', async () => {
      await gab.build();
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
        config: path.resolve(__dirname, './fixtures/gabliam/config'),
      });
      gab.addPlugin(KoaPlugin);
    });

    afterAll(() => {
      bind.resetHistory();
      config.resetHistory();
      start.resetHistory();
      stop.resetHistory();
      destroy.resetHistory();
    });

    test('gabliam build', async () => {
      await gab.build();
      expect(bind.calledOnce).toBe(true);
      expect(config.calledOnce).toBe(false);
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
