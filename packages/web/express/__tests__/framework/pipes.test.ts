import { Config, Container, Service } from '@gabliam/core';
import {
  Controller,
  Get,
  Pipe,
  RequestParam,
  UsePipes,
  WebConfig,
  WebConfiguration,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/lib/testing';
import * as sinon from 'sinon';
import ExpressPlugin from '../../src';

let appTest: WebPluginTest;

beforeEach(async () => {
  appTest = new WebPluginTest([ExpressPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

describe('pipes', () => {
  @Service()
  class A implements Pipe {
    transform(value: any) {
      return (value += 'a');
    }
  }

  @Service()
  class B implements Pipe {
    transform(value: any) {
      return (value += 'b');
    }
  }

  @Service()
  class C implements Pipe {
    transform(value: any) {
      return (value += 'c');
    }
  }

  const spyA = sinon.spy(A.prototype, 'transform');
  const spyB = sinon.spy(B.prototype, 'transform');
  const spyC = sinon.spy(C.prototype, 'transform');

  beforeEach(() => {
    spyA.resetHistory();
    spyB.resetHistory();
    spyC.resetHistory();
  });

  test('should call method-level Pipe correctly', async () => {
    @Controller('/')
    class TestController {
      @UsePipes(A, B, C)
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('should call controller-level Pipe correctly', async () => {
    @UsePipes(A, B, C)
    @Controller('/')
    class TestController {
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);

    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('`should call server-level pipe correctly`', async () => {
    @Controller('/')
    class TestController {
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }

    @Config()
    class ServerConfig {
      @WebConfig()
      serverConfig(app: any, container: Container) {
        const webConfiguration = container.get(WebConfiguration);
        webConfiguration.useGlobalPipes(A, B, C);
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('should call all pipe in correct order', async () => {
    @UsePipes(B)
    @Controller('/')
    class TestController {
      @UsePipes(C)
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }

    @Config()
    class ServerConfig {
      @WebConfig()
      serverConfig(app: any, container: Container) {
        const webConfiguration = container.get(WebConfiguration);
        webConfiguration.useGlobalPipes(A);
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('should resolve controller-level pipe', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @UsePipes(symbolId, strId)
    @Controller({
      path: '/',
    })
    class TestController {
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind(symbolId)
      .to(A)
      .inSingletonScope();
    appTest.gab.container
      .bind(strId)
      .to(B)
      .inSingletonScope();
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('should resolve method-level pipe', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller('/')
    class TestController {
      @UsePipes(symbolId, strId)
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind(symbolId)
      .to(A)
      .inSingletonScope();
    appTest.gab.container
      .bind(strId)
      .to(B)
      .inSingletonScope();
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('should compose controller- and method-level pipe', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @UsePipes(symbolId)
    @Controller({
      path: '/',
    })
    class TestController {
      @UsePipes(strId)
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind(symbolId)
      .to(A)
      .inSingletonScope();
    appTest.gab.container
      .bind(strId)
      .to(B)
      .inSingletonScope();
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });

  test('should compose controller- and method-level pipe and can use an instance', async () => {
    class D implements Pipe {
      constructor(private prefix: string) {}
      transform(value: any) {
        return (value += this.prefix + 'c');
      }
    }

    @UsePipes(A)
    @Controller({
      path: '/',
    })
    class TestController {
      @UsePipes(B, C, new D('||'))
      @Get('/:id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }

    appTest.addClass(TestController);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });
});
