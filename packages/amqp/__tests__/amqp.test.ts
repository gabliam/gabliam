import { AmqpPluginTest } from './amqp-plugin-test';
import { RabbitController, RabbitListener, RabbitConsumer } from '../src/index';
import { config } from './conf';
import { AmqpConnection } from '../src/amqp-connection';
import { Gabliam } from '@gabliam/core/lib';
import { Deferred } from './defered';
import * as sinon from 'sinon';

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

  test('with bad url', async () => {
    appTest.addConf('application.amqp', {
      url: 'amqp://bad',
      queues: {
        listener: {
          queueName: 'listenerTest',
          options: {
            durable: false
          }
        }
      }
    });
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });

  test('without queueName', async () => {
    appTest.addConf('application.amqp', {
      url: 'amqp://bad',
      queues: {
        queueTest: {
          name: 'lol'
        }
      }
    });
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });
});

describe('Listener test', () => {
  [
    {
      name: 'with buffer string',
      content: new Buffer('buffertest')
    },
    {
      name: 'with buffer object',
      content: new Buffer(JSON.stringify({ test: 'buffertest' }))
    },
    {
      name: 'with string',
      content: 'test'
    },
    {
      name: 'with object',
      content: { test: 'cool' }
    }
  ].forEach(testCase => {
    test(testCase.name, async () => {
      const d = new Deferred();
      @RabbitController()
      class ControllerTest {
        @RabbitListener('listenerTest')
        listener(msg: any) {
          d.resolve(msg);
        }
      }

      const spy = sinon.spy(ControllerTest.prototype, 'listener');

      appTest.addConf('application.amqp', config);
      appTest.addClass(ControllerTest);
      await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(
        Gabliam
      );
      const connection = appTest.gab.container.get(AmqpConnection);
      connection.sendToQueue('listenerTest', testCase.content);
      const resp = await d.promise;
      expect(resp).toMatchSnapshot();
      expect(spy.callCount).toMatchSnapshot();
      expect(spy.args).toMatchSnapshot();
      spy.reset();
    });
  });
});

describe('Consumer test', () => {
  [
    {
      name: 'with buffer string',
      content: new Buffer('buffertest')
    },
    {
      name: 'with buffer object',
      content: new Buffer(JSON.stringify({ test: 'buffertest' }))
    },
    {
      name: 'with string',
      content: 'test'
    },
    {
      name: 'with object',
      content: { test: 'cool' }
    }
  ].forEach(testCase => {
    test(testCase.name, async () => {
      @RabbitController()
      class ControllerTest {
        @RabbitConsumer('consumerTest')
        consumer(msg: any) {
          return msg;
        }
      }

      const spy = sinon.spy(ControllerTest.prototype, 'consumer');

      appTest.addConf('application.amqp', config);
      appTest.addClass(ControllerTest);
      await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(
        Gabliam
      );
      const connection = appTest.gab.container.get(AmqpConnection);
      const resp = await connection.sendAndReceive(
        'consumerTest',
        testCase.content
      );
      expect(resp).toMatchSnapshot();
      expect(spy.callCount).toMatchSnapshot();
      expect(spy.args).toMatchSnapshot();
      spy.reset();
    });
  });
});

test('consumer throw error', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTest')
    consumer(msg: any) {
      throw new Error('Consumer error');
    }
  }

  const spy = sinon.spy(ControllerTest.prototype, 'consumer');

  appTest.addConf('application.amqp', config);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(AmqpConnection);
  const resp = await connection.sendAndReceive('consumerTest', 'test');
  expect(resp).toMatchSnapshot();
  expect(spy.callCount).toMatchSnapshot();
  expect(spy.args).toMatchSnapshot();
  spy.reset();
});

test('sendAndReceive timeout', async () => {
  appTest.addConf('application.amqp', config);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(AmqpConnection);
  await expect(
    connection.sendAndReceive('consumerTest', 'test', {}, 100)
  ).rejects.toMatchSnapshot();
});

test('bad queue', async () => {
  @RabbitController()
  class ControllerTest {
    @RabbitConsumer('consumerTestBad')
    consumer(msg: any) {
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

  const spy = sinon.spy(ControllerTest.prototype, 'consumer');

  appTest.addConf('application.amqp', config);
  appTest.addClass(ControllerTest);
  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  await expect(appTest.startPlugins('AmqpPlugin'));
  const connection = appTest.gab.container.get(AmqpConnection);
  const resp = await connection.sendAndReceive(
    'consumerTest',
    'testCase.content'
  );
  expect(resp).toMatchSnapshot();
  expect(spy.callCount).toMatchSnapshot();
  expect(spy.args).toMatchSnapshot();
  spy.reset();
});
