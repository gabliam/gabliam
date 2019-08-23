import { Config, Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/src/testing';
import * as path from 'path';
import * as sinon from 'sinon';
import { ExpressPlugin } from '../src/express-plugin';

describe('test plugin', () => {
  const bind = sinon.spy(ExpressPlugin.prototype, 'bind');
  const config = sinon.spy(ExpressPlugin.prototype, 'config');
  const start = sinon.spy(ExpressPlugin.prototype, 'start');
  const stop = sinon.spy(ExpressPlugin.prototype, 'stop');
  const destroy = sinon.spy(ExpressPlugin.prototype, 'destroy');
  let gab: Gabliam;

  describe('with config', () => {
    beforeAll(() => {
      const g = new GabliamTest(new Gabliam().addPlugin(ExpressPlugin));
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
      gab.addPlugin(ExpressPlugin);
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
