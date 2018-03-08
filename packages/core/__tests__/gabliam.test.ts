// tslint:disable:one-line
// tslint:disable:no-unused-expression
import {
  Gabliam,
  APP_CONFIG,
  CORE_CONFIG,
  Container,
  Registry,
  Config,
  Plugin,
  GabliamPlugin,
  Init,
  Bean,
  OnMissingBean,
  BeforeCreate
} from '../src';
import * as path from 'path';
import { TestService } from './fixtures/gabliam/service';
import { DbConfig } from './fixtures/gabliam/db-config';
import * as sinon from 'sinon';
import { GabliamTest } from '../src/testing/gabliam';

test('gabliam instance', async () => {
  const gab = new Gabliam({
    scanPath: path.resolve(__dirname, './fixtures/gabliam'),
    config: path.resolve(__dirname, './fixtures/gabliam/config')
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
  expect(gab.options).toEqual({ config: undefined });
  await gab.destroy();
});

test('gabliam instance with path', async () => {
  const gab = new Gabliam({
    scanPath: path.resolve(__dirname, './fixtures/gabliam'),
    config: path.resolve(__dirname, './fixtures/gabliam/config')
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
  @Plugin()
  class PluginTest implements GabliamPlugin {
    build(container: Container, registry: Registry): void {}

    bind(container: Container, registry: Registry): void {}

    config(container: Container, registry: Registry, confInstance: any): void {}

    start(container: Container, registry: Registry): Promise<void> {
      return Promise.resolve();
    }

    stop(container: Container, registry: Registry): Promise<void> {
      return Promise.resolve();
    }

    destroy(container: Container, registry: Registry): Promise<void> {
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
      const g = new GabliamTest(new Gabliam().addPlugin(PluginTest));
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
        config: path.resolve(__dirname, './fixtures/gabliam/config')
      });
      gab.addPlugin(PluginTest);
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

test('should fail with bad Plugin', () => {
  class BadPlugin {}
  const g = new GabliamTest();
  expect(() => {
    g.gab.addPlugin(BadPlugin);
  }).toThrowError();
});

test('ok with Plugin', async () => {
  @Plugin()
  class Plugin1 {}

  @Plugin({ dependencies: ['Plugin1'] })
  class Plugin2 {}

  @Plugin({ dependencies: [{ name: 'Plugin2', order: 'before' }] })
  class Plugin3 {}
  const g = new GabliamTest();
  g.gab.addPlugin(Plugin1);
  g.gab.addPlugin(Plugin2);
  g.gab.addPlugin(Plugin3);
  await expect(g.build()).resolves;
});

test('ok with Plugin 2', async () => {
  @Plugin()
  class Plugin1 {}

  @Plugin({ dependencies: ['Plugin1'] })
  class Plugin2 {}

  @Plugin({ dependencies: [{ name: 'Plugin2', order: 'after' }] })
  class Plugin3 {}

  @Plugin({
    dependencies: [{ name: 'Plugin3', order: 'after' }]
  })
  class Plugin4 {}
  const g = new GabliamTest();
  g.gab.addPlugin(Plugin4);
  g.gab.addPlugin(Plugin3);
  g.gab.addPlugin(Plugin1);
  g.gab.addPlugin(Plugin2);
  await expect(g.build()).resolves;
});

test('should fail with Plugin with bad deps', async () => {
  @Plugin({ dependencies: ['BadDeps'] })
  class BadPlugin {}
  const g = new GabliamTest();
  g.gab.addPlugin(BadPlugin);
  await expect(g.build()).rejects.toMatchSnapshot();
});

test('plugin findByName', () => {
  @Plugin()
  class BadPlugin {}
  const g = new GabliamTest();
  g.gab.addPlugin(BadPlugin);
  expect(g.gab.pluginList.findByName('BadPlugin')).toMatchSnapshot();
});

test('test init', async () => {
  let res = '';
  @Config(300)
  class Conf {
    constructor() {
      res += '|Conf';
    }

    @Init()
    init() {
      res += '|initConf';
    }
  }
  @Config(200)
  class Conf2 {
    constructor() {
      res += '|Conf2';
    }

    @Init()
    init() {
      res += '|initConf2';
    }
  }
  const g = new GabliamTest();
  g.addClass(Conf);
  g.addClass(Conf2);
  await g.build();
  expect(res).toMatchSnapshot();
});

test('@onMissingBean', async () => {
  let res = '';
  @Config(300)
  class Conf {
    constructor() {
      res += '|constructConf';
    }

    @OnMissingBean('conf1')
    @Bean('conf1')
    conf1() {
      res += '|conf1';
    }
  }
  @Config(200)
  class Conf2 {
    constructor() {
      res += '|constructConf2';
    }

    @OnMissingBean('conf1')
    @Bean('conf2')
    conf2() {
      res += '|Conf2';
    }
  }
  const g = new GabliamTest();
  g.addClass(Conf);
  g.addClass(Conf2);
  await g.build();
  expect(res).toMatchSnapshot();
});

test('@onMissingBean 2', async () => {
  let res = '';
  @Config(200)
  class Conf {
    constructor() {
      res += '|constructConf';
    }

    @OnMissingBean('conf1')
    @Bean('conf1')
    conf1() {
      res += '|conf1';
    }
  }
  @Config(300)
  class Conf2 {
    constructor() {
      res += '|constructConf2';
    }

    @OnMissingBean('conf1')
    @Bean('conf2')
    conf2() {
      res += '|Conf2';
    }
  }
  const g = new GabliamTest();
  g.addClass(Conf);
  g.addClass(Conf2);
  await g.build();
  expect(res).toMatchSnapshot();
});

test('@onMissingBean with multiple missing but just one is missing', async () => {
  let res = '';
  @Config(200)
  class Conf {
    constructor() {
      res += '|constructConf';
    }

    @OnMissingBean('conf1')
    @Bean('conf1')
    conf1() {
      res += '|conf1';
    }
  }
  @Config(300)
  class Conf2 {
    constructor() {
      res += '|constructConf2';
    }

    @OnMissingBean('conf3')
    @OnMissingBean('conf1')
    @Bean('conf2')
    conf2() {
      res += '|Conf2';
    }
  }
  const g = new GabliamTest();
  g.addClass(Conf);
  g.addClass(Conf2);
  await g.build();
  expect(res).toMatchSnapshot();
});

test('test BeforeCreate', async () => {
  let res = '';
  @Config(300)
  class Conf {
    constructor() {
      res += '|Conf';
    }

    @BeforeCreate()
    beforeCreate() {
      res += '|BeforeCreateConf';
    }
  }
  @Config(200)
  class Conf2 {
    constructor() {
      res += '|Conf2';
    }

    @BeforeCreate()
    beforeCreate() {
      res += '|BeforeCreateConf2';
    }
  }
  const g = new GabliamTest();
  g.addClass(Conf);
  g.addClass(Conf2);
  await g.build();
  expect(res).toMatchSnapshot();
});

test('test BeforeCreate & init', async () => {
  let res = '';
  @Config(300)
  class Conf {
    constructor() {
      res += '|Conf';
    }
    @Init()
    init() {
      res += '|InitCreateConf';
    }

    @Bean('create')
    create() {
      res += '|create';
      return 'create';
    }

    @BeforeCreate()
    beforeCreate() {
      res += '|BeforeCreateConf';
    }
  }
  @Config(200)
  class Conf2 {
    constructor() {
      res += '|Conf2';
    }

    @BeforeCreate()
    beforeCreate() {
      res += '|BeforeCreateConf2';
    }

    @Bean('create2')
    create() {
      res += '|create2';
      return 'create2';
    }

    @Init()
    init() {
      res += '|InitCreateConf2';
    }
  }
  const g = new GabliamTest();
  g.addClass(Conf);
  g.addClass(Conf2);
  await g.build();
  g.gab.container.get('create');
  g.gab.container.get('create2');
  expect(res).toMatchSnapshot();
});
