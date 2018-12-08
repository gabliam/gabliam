import { AmqpPluginTest } from './amqp-plugin-test';
import {
  RabbitController,
  RabbitListener,
  RabbitConsumer,
  Message,
  Content,
  Properties,
  Fields,
} from '../src/index';
import { config } from './conf';
import { AmqpConnection } from '../src/amqp-connection';
import { Gabliam } from '@gabliam/core';
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

describe('Parameters:', () => {
  test('should bind a method parameter to message', async () => {
    const d = new Deferred();

    @RabbitController()
    class ControllerTest {
      @RabbitConsumer('consumerTest')
      consumer(@Message() msg: any) {
        return msg;
      }

      @RabbitListener('listenerTest')
      listener(@Message() msg: any) {
        d.resolve(msg);
      }
    }
    const spyConsumer = sinon.spy(ControllerTest.prototype, 'consumer');
    const spyListener = sinon.spy(ControllerTest.prototype, 'listener');

    appTest.addConf('application.amqp', config);
    appTest.addClass(ControllerTest);
    await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
    const connection = appTest.gab.container.get(AmqpConnection);

    const respConsumer = await connection.sendAndReceive(
      'consumerTest',
      'TEST'
    );
    expect(respConsumer).toMatchSnapshot<any>({
      properties: {
        correlationId: expect.any(String),
        replyTo: expect.any(String),
      },
      fields: {
        consumerTag: expect.any(String),
      },
    });
    expect(spyConsumer.callCount).toMatchSnapshot();
    spyConsumer.resetHistory();

    connection.sendToQueue('listenerTest', 'TEST');
    const resp = await d.promise;
    expect(resp).toMatchSnapshot<any>({
      fields: {
        consumerTag: expect.any(String),
      },
    });
    expect(spyListener.callCount).toMatchSnapshot();
    spyListener.resetHistory();
  });

  [
    {
      name: 'to the content object and call with buffer string',
      content: new Buffer('buffertest'),
      args: undefined,
    },
    {
      name: 'to the content key not exist and call with buffer string',
      content: new Buffer('buffertest'),
      args: 'test',
    },
    {
      name: 'to the content object and with buffer object',
      content: new Buffer(JSON.stringify({ test: 'buffertest' })),
      args: undefined,
    },
    {
      name: 'to the content key not exist and with buffer object',
      content: new Buffer(JSON.stringify({ test: 'buffertest' })),
      args: 'testlol',
    },
    {
      name: 'to the content object and with string',
      content: 'test',
      args: undefined,
    },
    {
      name: 'to the content key not exist and with string',
      content: 'test',
      args: 'test',
    },
    {
      name: 'to the content object and with object',
      content: { test: 'cool' },
      args: undefined,
    },
    {
      name: 'to the content and with object',
      content: { test: 'cool' },
      args: 'test',
    },
    {
      name: 'to the content key not exist and with object',
      content: { test: 'cool' },
      args: 'testlol',
    },
  ].forEach(testCase => {
    test(`should bind a method parameter ${testCase.name}`, async () => {
      const d = new Deferred();

      @RabbitController()
      class ControllerTest {
        @RabbitConsumer('consumerTest')
        consumer(@Content(testCase.args) content: any) {
          return content;
        }

        @RabbitListener('listenerTest')
        listener(@Content(testCase.args) content: any) {
          d.resolve(content);
        }
      }
      const spyConsumer = sinon.spy(ControllerTest.prototype, 'consumer');
      const spyListener = sinon.spy(ControllerTest.prototype, 'listener');

      appTest.addConf('application.amqp', config);
      appTest.addClass(ControllerTest);
      await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(
        Gabliam
      );
      const connection = appTest.gab.container.get(AmqpConnection);

      const respConsumer = await connection.sendAndReceive(
        'consumerTest',
        testCase.content
      );
      expect(respConsumer).toMatchSnapshot();
      expect(spyConsumer.callCount).toMatchSnapshot();
      spyConsumer.resetHistory();

      connection.sendToQueue('listenerTest', testCase.content);
      const resp = await d.promise;
      expect(resp).toMatchSnapshot();
      expect(spyListener.callCount).toMatchSnapshot();
      spyListener.resetHistory();
    });
  });

  test(`should bind a method to Properties object`, async () => {
    const d = new Deferred();

    @RabbitController()
    class ControllerTest {
      @RabbitConsumer('consumerTest')
      consumer(@Properties() content: any) {
        return content;
      }

      @RabbitListener('listenerTest')
      listener(@Properties() content: any) {
        d.resolve(content);
      }
    }
    const spyConsumer = sinon.spy(ControllerTest.prototype, 'consumer');
    const spyListener = sinon.spy(ControllerTest.prototype, 'listener');

    appTest.addConf('application.amqp', config);
    appTest.addClass(ControllerTest);
    await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
    const connection = appTest.gab.container.get(AmqpConnection);

    const respConsumer = await connection.sendAndReceive(
      'consumerTest',
      'test'
    );
    expect(respConsumer).toMatchSnapshot({
      correlationId: expect.any(String),
      replyTo: expect.any(String),
    });
    expect(spyConsumer.callCount).toMatchSnapshot();
    spyConsumer.resetHistory();

    connection.sendToQueue('listenerTest', 'test');
    const resp = await d.promise;
    expect(resp).toMatchSnapshot();
    expect(spyListener.callCount).toMatchSnapshot();
    spyListener.resetHistory();
  });

  test(`should bind a method to Properties headers `, async () => {
    const d = new Deferred();

    @RabbitController()
    class ControllerTest {
      @RabbitConsumer('consumerTest')
      consumer(@Properties('headers') content: any) {
        return content;
      }

      @RabbitListener('listenerTest')
      listener(@Properties('headers') content: any) {
        d.resolve(content);
      }
    }
    const spyConsumer = sinon.spy(ControllerTest.prototype, 'consumer');
    const spyListener = sinon.spy(ControllerTest.prototype, 'listener');

    appTest.addConf('application.amqp', config);
    appTest.addClass(ControllerTest);
    await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
    const connection = appTest.gab.container.get(AmqpConnection);

    const respConsumer = await connection.sendAndReceive(
      'consumerTest',
      'test',
      {
        headers: {
          'api-auth': 'aze&ée((("a&é"&é"',
        },
      }
    );
    expect(respConsumer).toMatchSnapshot();
    expect(spyConsumer.callCount).toMatchSnapshot();
    spyConsumer.resetHistory();

    connection.sendToQueue('listenerTest', 'test', {
      headers: {
        'api-auth': 'aze&ée((("a&é"&é"',
      },
    });
    const resp = await d.promise;
    expect(resp).toMatchSnapshot();
    expect(spyListener.callCount).toMatchSnapshot();
    spyListener.resetHistory();
  });

  test(`should bind a method to Fields object`, async () => {
    const d = new Deferred();

    @RabbitController()
    class ControllerTest {
      @RabbitConsumer('consumerTest')
      consumer(@Fields() content: any) {
        return content;
      }

      @RabbitListener('listenerTest')
      listener(@Fields() content: any) {
        d.resolve(content);
      }
    }
    const spyConsumer = sinon.spy(ControllerTest.prototype, 'consumer');
    const spyListener = sinon.spy(ControllerTest.prototype, 'listener');

    appTest.addConf('application.amqp', config);
    appTest.addClass(ControllerTest);
    await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
    const connection = appTest.gab.container.get(AmqpConnection);

    const respConsumer = await connection.sendAndReceive(
      'consumerTest',
      'test'
    );
    expect(respConsumer).toMatchSnapshot({
      consumerTag: expect.any(String),
      deliveryTag: expect.any(Number),
      exchange: expect.any(String),
      redelivered: expect.any(Boolean),
    });
    expect(spyConsumer.callCount).toMatchSnapshot();
    spyConsumer.resetHistory();

    connection.sendToQueue('listenerTest', 'test');
    const resp = await d.promise;
    expect(resp).toMatchSnapshot({
      consumerTag: expect.any(String),
      deliveryTag: expect.any(Number),
      exchange: expect.any(String),
      redelivered: expect.any(Boolean),
    });
    expect(spyListener.callCount).toMatchSnapshot();
    spyListener.resetHistory();
  });

  test(`should bind a method to Fields routingKey `, async () => {
    const d = new Deferred();

    @RabbitController()
    class ControllerTest {
      @RabbitConsumer('consumerTest')
      consumer(@Fields('routingKey') content: any) {
        return content;
      }

      @RabbitListener('listenerTest')
      listener(@Fields('routingKey') content: any) {
        d.resolve(content);
      }
    }
    const spyConsumer = sinon.spy(ControllerTest.prototype, 'consumer');
    const spyListener = sinon.spy(ControllerTest.prototype, 'listener');

    appTest.addConf('application.amqp', config);
    appTest.addClass(ControllerTest);
    await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
    const connection = appTest.gab.container.get(AmqpConnection);

    const respConsumer = await connection.sendAndReceive(
      'consumerTest',
      'test'
    );
    expect(respConsumer).toMatchSnapshot();
    expect(spyConsumer.callCount).toMatchSnapshot();
    spyConsumer.resetHistory();

    connection.sendToQueue('listenerTest', 'test');
    const resp = await d.promise;
    expect(resp).toMatchSnapshot();
    expect(spyListener.callCount).toMatchSnapshot();
    spyListener.resetHistory();
  });
});
