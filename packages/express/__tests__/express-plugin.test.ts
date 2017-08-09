import { Config, Gabliam } from '@gabliam/core';
import * as sinon from 'sinon';
import { ExpressPlugin } from '../src/express-plugin';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as path from 'path';

describe('test plugin', async () => {
  const build = sinon.spy(ExpressPlugin.prototype, 'build');
  const bind = sinon.spy(ExpressPlugin.prototype, 'bind');
  const config = sinon.spy(ExpressPlugin.prototype, 'config');
  const start = sinon.spy(ExpressPlugin.prototype, 'start');
  const stop = sinon.spy(ExpressPlugin.prototype, 'stop');
  const destroy = sinon.spy(ExpressPlugin.prototype, 'destroy');
  let gab: Gabliam;

  describe('with config', () => {
    beforeAll(() => {
      const g = new GabliamTest(
        new Gabliam({
          scanPath: path.resolve(__dirname, 'gabliam'),
          configPath: path.resolve(__dirname, 'gabliam')
        }).addPlugin(ExpressPlugin)
      );
      gab = g.gab;

      @Config()
      class Conf {}
      g.addClass(Conf);
    });

    afterAll(() => {
      build.reset();
      bind.reset();
      config.reset();
      start.reset();
      stop.reset();
      destroy.reset();
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
        configPath: path.resolve(__dirname, './fixtures/gabliam/config')
      });
      gab.addPlugin(ExpressPlugin);
    });

    afterAll(() => {
      build.reset();
      bind.reset();
      config.reset();
      start.reset();
      stop.reset();
      destroy.reset();
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
