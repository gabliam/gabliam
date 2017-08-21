import { Log4jsPluginTest } from './log4js-plugin-test';
import { Service } from '@gabliam/core';
import { log4js } from '../src/index';
import * as path from 'path';
import * as sinon from 'sinon';

let appTest: Log4jsPluginTest;
const p = sinon.spy(process.stdout, 'write');

describe('without config folder', () => {
  beforeEach(async () => {
    appTest = new Log4jsPluginTest();
  });

  afterEach(async () => {
    await appTest.destroy();
    p.reset();
  });

  test('without config', async () => {
    @Service()
    class TestLog {
      public logger = log4js.getLogger(TestLog.name);

      test() {
        this.logger.info('Info');
        this.logger.debug('debug');
        this.logger.error('error');
        this.logger.fatal('fatal');
        this.logger.warn('warn');
      }
    }

    appTest.addClass(TestLog);
    await appTest.build();
    const testLog = appTest.gab.container.get(TestLog);
    testLog.test();
    expect(p.callCount).toMatchSnapshot();
  });
});

describe('with config folder', () => {
  beforeEach(async () => {
    appTest = new Log4jsPluginTest(
      path.resolve(__dirname, './fixtures/defaultFilePathConfig')
    );
  });

  afterEach(async () => {
    await appTest.destroy();
    p.reset();
  });

  test('default config', async () => {
    @Service()
    class TestLog {
      public logger = log4js.getLogger(TestLog.name);

      test() {
        this.logger.info('Info');
        this.logger.debug('debug');
        this.logger.error('error');
        this.logger.fatal('fatal');
        this.logger.warn('warn');
      }
    }

    appTest.addClass(TestLog);
    await appTest.build();
    const testLog = appTest.gab.container.get(TestLog);
    testLog.test();
    expect(p.callCount).toMatchSnapshot();
  });

  test('custom config', async () => {
    @Service()
    class TestLog {
      public logger = log4js.getLogger(TestLog.name);

      test() {
        this.logger.info('Info');
        this.logger.debug('debug');
        this.logger.error('error');
        this.logger.fatal('fatal');
        this.logger.warn('warn');
      }
    }

    appTest.addConf(
      'application.loggerConfigPath',
      '../customConfig/log4js-custom.json'
    );
    appTest.addClass(TestLog);
    await appTest.build();
    const testLog = appTest.gab.container.get(TestLog);
    testLog.test();
    expect(p.callCount).toMatchSnapshot();
  });
});
