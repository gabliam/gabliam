import { Gabliam } from '@gabliam/core';
import { spy } from 'sinon';
import { AmqpConnection } from '../src/amqp-connection';
import {
  AmqpConnectionManager,
  CUnit,
  RabbitConsumer,
  RabbitController,
  RabbitListener,
} from '../src/index';
import { AmqpPluginTest } from './amqp-plugin-test';
import {
  config,
  configWith2Connection,
  configWithDuplicateConnection,
  configWithName,
} from './conf';
import { Deferred } from './defered';

let appTest: AmqpPluginTest;
beforeEach(async () => {
  appTest = new AmqpPluginTest();
});

afterEach(async () => {
  try {
    await appTest.gab.stop();
  } catch (e) {}
  try {
    await appTest.destroy();
  } catch (e) {}
});

describe('Errors', () => {
  test('without config folder', async () => {
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });

  test('with bad config', async () => {
    appTest.addConf('application.amqp', 'bad');
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });

  test.skip('with bad url', async () => {
    appTest.addConf('application.amqp', {
      url: 'amqp://bad',
      queues: {
        listener: {
          queueName: 'listenerTest',
          options: {
            durable: false,
          },
        },
      },
    });
    await expect(appTest.gab.buildAndStart()).rejects.toThrow();
  });

  test('without queueName', async () => {
    appTest.addConf('application.amqp', {
      url: 'amqp://bad',
      queues: {
        queueTest: {
          name: 'lol',
        },
      },
    });
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });
});

describe('Listener test', () => {
  [
    {
      name: 'with buffer string',
      content: Buffer.from('buffertest'),
    },
    {
      name: 'with buffer object',
      content: Buffer.from(JSON.stringify({ test: 'buffertest' })),
    },
    {
      name: 'with string',
      content: 'test',
    },
    {
      name: 'with object',
      content: { test: 'cool' },
    },
    {
      name: 'with undefined',
      content: undefined,
    },
  ].forEach((testCase) => {
    test(testCase.name, async () => {
      const d = new Deferred();
      @RabbitController()
      class ControllerTest {
        @RabbitListener('listenerTest')
        listener(msg: any) {
          d.resolve(msg);
        }
      }

      const sinonSpy = spy(ControllerTest.prototype, 'listener');

      appTest.addConf('application.amqp', config);
      appTest.addClass(ControllerTest);
      await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(
        Gabliam,
      );
      const connection = appTest.gab.container.get(AmqpConnection);
      connection.sendToQueue('listenerTest', testCase.content);
      const resp = await d.promise;
      expect(resp).toMatchSnapshot();
      expect(sinonSpy.callCount).toMatchSnapshot();
      expect(sinonSpy.args).toMatchSnapshot();
      sinonSpy.resetHistory();
    });
  });
});

describe('Consumer test', () => {
  [
    {
      name: 'with buffer string',
      content: Buffer.from('buffertest'),
    },
    {
      name: 'with buffer object',
      content: Buffer.from(JSON.stringify({ test: 'buffertest' })),
    },
    {
      name: 'with string',
      content: 'test',
    },
    {
      name: 'with object',
      content: { test: 'cool' },
    },
  ].forEach((testCase) => {
    test(testCase.name, async () => {
      @RabbitController()
      class ControllerTest {
        @RabbitConsumer('consumerTest')
        consumer(msg: any) {
          return msg;
        }
      }

      const sinonSpy = spy(ControllerTest.prototype, 'consumer');

      appTest.addConf('application.amqp', config);
      appTest.addClass(ControllerTest);
      await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(
        Gabliam,
      );
      const connection = appTest.gab.container.get(AmqpConnection);
      const resp = await connection.sendAndReceive(
        'consumerTest',
        testCase.content,
      );
      expect(resp).toMatchSnapshot();
      expect(sinonSpy.callCount).toMatchSnapshot();
      expect(sinonSpy.args).toMatchSnapshot();
      sinonSpy.resetHistory();
    });
  });
});

test('consumer throw error', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTest')
    consumer() {
      throw new Error('Consumer error');
    }
  }

  const sinonSpy = spy(ControllerTest.prototype, 'consumer');

  appTest.addConf('application.amqp', config);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(AmqpConnection);
  const resp = await connection.sendAndReceive('consumerTest', 'test');
  expect(resp).toMatchSnapshot<any>({
    stack: expect.any(String),
  });
  expect(sinonSpy.callCount).toMatchSnapshot();
  expect(sinonSpy.args).toMatchSnapshot();
  sinonSpy.resetHistory();
});

test('sendAndReceive timeout', async () => {
  appTest.addConf('application.amqp', config);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(AmqpConnection);
  await expect(
    connection.sendAndReceive('consumerTest', 'test', {}, 100),
  ).rejects.toMatchSnapshot();
});

test('bad queue', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTestBad')
    consumer() {
      throw new Error('Consumer error');
    }
  }

  appTest.addConf('application.amqp', config);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('start 2 times', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTest')
    consumer(msg: any) {
      return msg;
    }
  }

  const sinonSpy = spy(ControllerTest.prototype, 'consumer');

  appTest.addConf('application.amqp', config);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  await expect(appTest.startPlugins('AmqpPlugin'));
  const connection = appTest.gab.container.get(AmqpConnection);
  const resp = await connection.sendAndReceive(
    'consumerTest',
    'testCase.content',
  );
  expect(resp).toMatchSnapshot();
  expect(sinonSpy.callCount).toMatchSnapshot();
  expect(sinonSpy.args).toMatchSnapshot();
  sinonSpy.resetHistory();
});

test('must fail when getConnection not found', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTest')
    consumer(msg: any) {
      return msg;
    }
  }

  appTest.addConf('application.amqp', config);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  await expect(appTest.startPlugins('AmqpPlugin'));
  const connection = appTest.gab.container.get(AmqpConnectionManager);
  await expect(() =>
    connection.getConnection('notfound'),
  ).toThrowErrorMatchingSnapshot();
});

test('with one connection with name and entity without cunit', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTest')
    consumer(msg: any) {
      return msg;
    }
  }

  const sinonSpy = spy(ControllerTest.prototype, 'consumer');

  appTest.addConf('application.amqp', configWithName);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  await expect(appTest.startPlugins('AmqpPlugin'));
  const connection = appTest.gab.container.get(AmqpConnection);
  const resp = await connection.sendAndReceive(
    'consumerTest',
    'testCase.content',
  );
  expect(resp).toMatchSnapshot();
  expect(sinonSpy.callCount).toMatchSnapshot();
  expect(sinonSpy.args).toMatchSnapshot();
  sinonSpy.resetHistory();
});

test('with config 2 database', async () => {
  @CUnit('connection1')
  @RabbitController()
  class ControllerTestConnection1 {
    @RabbitConsumer('consummer')
    consumer(msg: any) {
      return `connection1${msg}`;
    }
  }

  @CUnit('connection2')
  @RabbitController()
  class ControllerTestConnection2 {
    @RabbitConsumer('consummer')
    consumer(msg: any) {
      return `connection2${msg}`;
    }
  }

  appTest.addConf('application.amqp', configWith2Connection);
  appTest.addClass(ControllerTestConnection1);
  appTest.addClass(ControllerTestConnection2);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);

  const connectionManager = appTest.gab.container.get(AmqpConnectionManager);

  const connection1 = connectionManager.getConnection('connection1');

  const resp = await connection1.sendAndReceive('consummer', 'testCase');
  expect(resp).toMatchSnapshot();

  const connection2 = connectionManager.getConnection('connection1');

  const resp2 = await connection2.sendAndReceive('consummer', 'testCase');
  expect(resp2).toMatchSnapshot();
});

test('must fail when CUnit not found', async () => {
  appTest.addConf('application.amqp', config);

  @CUnit('bad')
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTest')
    consumer(msg: any) {
      return msg;
    }
  }
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('must fail with duplicate connections', async () => {
  appTest.addConf('application.amqp', configWithDuplicateConnection);
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});
