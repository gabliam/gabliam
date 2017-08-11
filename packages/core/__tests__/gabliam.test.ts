// tslint:disable:one-line
// tslint:disable:no-unused-expression

import {
  Gabliam,
  APP_CONFIG,
  CORE_CONFIG,
  interfaces,
  inversifyInterfaces,
  Registry,
  Config,
  Plugin
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

test('gabliam instance with default config', async () => {
  const gab = new Gabliam();
  expect(gab.options).toEqual({
    scanPath: process.env.PWD,
    configPath: process.env.PWD
  });
  await gab.destroy();
});

test('gabliam instance with path', async () => {
  const gab = new Gabliam(path.resolve(__dirname, './fixtures/gabliam'));
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
  @Plugin()
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
    let res = '';
    beforeAll(() => {
      const g = new GabliamTest(
        new Gabliam({
          scanPath: path.resolve(__dirname, 'gabliam'),
          configPath: path.resolve(__dirname, 'gabliam')
        }).addPlugin(PluginTest)
      );
      gab = g.gab;

      @Config(300)
      class Conf {
        constructor() {
          res += 'Conf';
        }
      }
      @Config(200)
      class Conf2 {
        constructor() {
          res += 'Conf2';
        }
      }

      g.addClass(Conf);
      g.addClass(Conf2);
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
      expect(res).toMatchSnapshot();
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

test('should fail with bad Plugin', () => {
  class BadPlugin {}
  const g = new GabliamTest();
  expect(() => {
    g.gab.addPlugin(BadPlugin);
  }).toThrowError();
});

test('should fail with Plugin with bad deps', () => {
  @Plugin({ dependencies: ['BadPlugin'] })
  class BadPlugin {}
  const g = new GabliamTest();
  expect(() => {
    g.gab.addPlugin(BadPlugin);
  }).toThrowError();
});

test('plugin findByName', () => {
  @Plugin()
  class BadPlugin {}
  const g = new GabliamTest();
  g.gab.addPlugin(BadPlugin);
  expect(g.gab.pluginList.findByName('BadPlugin')).toMatchSnapshot();
});
