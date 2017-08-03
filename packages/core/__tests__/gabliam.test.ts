// tslint:disable:one-line
// tslint:disable:no-unused-expression

import {
  Gabliam,
  APP_CONFIG,
  CORE_CONFIG,
  interfaces,
  inversifyInterfaces,
  Registry,
  Config
} from '../src';
import * as path from 'path';
import { TestService } from './fixtures/gabliam/service';
import { DbConfig } from './fixtures/gabliam/db-config';
import * as sinon from 'sinon';
import { GabliamTest } from '../src/testing/gabliam';

test('gabliam instance', async () => {
  const gab = new Gabliam({
    scanPath: path.resolve(__dirname, './fixtures/gabliam'),
    configPath: path.resolve(__dirname, './fixtures/gabliam/config')
  });
  await gab.buildAndStart();
  // @todo write a guid serializer
  // expect(gab).toMatchSnapshot();
  expect(gab.container.get(APP_CONFIG)).toMatchSnapshot();
  expect(gab.container.get(CORE_CONFIG)).toMatchSnapshot();
  expect(gab.container.get(TestService)).toMatchSnapshot();
  expect(gab.container.get(DbConfig)).toMatchSnapshot();
  await gab.destroy();
});

describe('test plugin', async () => {
  class PluginTest implements interfaces.GabliamPlugin {
    build(container: inversifyInterfaces.Container, registry: Registry): void {}

    bind(container: inversifyInterfaces.Container, registry: Registry): void {}

    config(
      container: inversifyInterfaces.Container,
      registry: Registry,
      confInstance: any
    ): void {}

    start(
      container: inversifyInterfaces.Container,
      registry: Registry
    ): Promise<void> {
      return Promise.resolve();
    }

    stop(
      container: inversifyInterfaces.Container,
      registry: Registry
    ): Promise<void> {
      return Promise.resolve();
    }

    destroy(
      container: inversifyInterfaces.Container,
      registry: Registry
    ): Promise<void> {
      return Promise.resolve();
    }
  }

  const build = sinon.spy(PluginTest.prototype, 'build');
  const bind = sinon.spy(PluginTest.prototype, 'bind');
  const config = sinon.spy(PluginTest.prototype, 'config');
  const start = sinon.spy(PluginTest.prototype, 'start');
  const stop = sinon.spy(PluginTest.prototype, 'stop');
  const destroy = sinon.spy(PluginTest.prototype, 'destroy');
  let gab: Gabliam;

  describe('with config', () => {
    beforeAll(() => {
      const g = new GabliamTest(
        new Gabliam({
          scanPath: path.resolve(__dirname, 'gabliam'),
          configPath: path.resolve(__dirname, 'gabliam')
        }).addPlugin(PluginTest)
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
      gab.addPlugin(PluginTest);
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
