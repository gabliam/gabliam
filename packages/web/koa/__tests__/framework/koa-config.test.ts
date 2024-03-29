import { Config } from '@gabliam/core';
import { Controller, Get, WebConfig } from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import { spy } from 'sinon';
import KoaPlugin, { koa, koaRouter } from '../../src';

let appTest: WebPluginTest;
let result: string;
const middleware: any = {
  async a(ctx: koaRouter.IRouterContext, nextFunc: () => Promise<any>) {
    result += 'a';
    await nextFunc();
  },
  async b(ctx: koaRouter.IRouterContext, nextFunc: () => Promise<any>) {
    result += 'b';
    await nextFunc();
  },
  async c(ctx: koaRouter.IRouterContext, nextFunc: () => Promise<any>) {
    result += 'c';
    await nextFunc();
  },
  async e(ctx: koaRouter.IRouterContext, nextFunc: () => Promise<any>) {
    result += 'e';
    ctx.throw(500);
  },
  async d(ctx: koaRouter.IRouterContext, nextFunc: () => Promise<any>) {
    result += 'd';
    await nextFunc();
  },
};
const spyA = spy(middleware, 'a');
const spyB = spy(middleware, 'b');
const spyC = spy(middleware, 'c');
const spyE = spy(middleware, 'e');
const spyD = spy(middleware, 'd');

beforeEach(async () => {
  result = '';
  spyA.resetHistory();
  spyB.resetHistory();
  spyC.resetHistory();
  spyE.resetHistory();
  spyD.resetHistory();
  appTest = new WebPluginTest([KoaPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

test('@KoaConfig', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest() {
      return 'GET';
    }
  }

  @Config()
  class ServerConfig {
    @WebConfig()
    serverConfig(app: koa) {
      app.use(spyA);
      app.use(spyB);
      app.use(spyC);
    }
  }

  appTest.addClass(TestController);
  appTest.addClass(ServerConfig);
  await appTest.buildAndStart();

  const response = await appTest.supertest().get('/').expect(200);
  expect(spyA.calledOnce).toBe(true);
  expect(spyB.calledOnce).toBe(true);
  expect(spyC.calledOnce).toBe(true);
  expect(response).toMatchSnapshot();
  expect(result).toMatchSnapshot();
});

test('@KoaConfig Order', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest() {
      return 'GET';
    }
  }

  @Config()
  class ServerConfig {
    @WebConfig(150)
    serverConfigC(app: koa) {
      app.use(spyC);
    }

    @WebConfig(100)
    serverConfigB(app: koa) {
      app.use(spyB);
    }

    @WebConfig(50)
    serverConfigA(app: koa) {
      app.use(spyA);
    }
  }

  appTest.addClass(TestController);
  appTest.addClass(ServerConfig);
  await appTest.buildAndStart();

  const response = await appTest.supertest().get('/').expect(200);
  expect(spyA.calledOnce).toBe(true);
  expect(spyB.calledOnce).toBe(true);
  expect(spyC.calledOnce).toBe(true);
  expect(response).toMatchSnapshot();
  expect(result).toMatchSnapshot();
});

test('ErrorConfig', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(ctx: koaRouter.IRouterContext) {
      throw new Error();
    }
  }

  @Config()
  class ServerConfig {
    @WebConfig()
    serverConfig(app: koa) {
      app.use(spyE);
    }
  }

  appTest.addClass(TestController);
  appTest.addClass(ServerConfig);
  await appTest.buildAndStart();

  const response = await appTest.supertest().get('/').expect(500);
  expect(spyE.calledOnce).toBe(true);
  expect(response).toMatchSnapshot();
  expect(result).toMatchSnapshot();
});

test('ErrorConfig order', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(ctx: koaRouter.IRouterContext) {
      throw new Error();
    }
  }

  @Config()
  class ServerConfig {
    @WebConfig(100)
    serverConfig(app: koa) {
      app.use(spyE);
    }

    @WebConfig(50)
    serverConfigD(app: koa) {
      app.use(spyD);
    }
  }

  appTest.addClass(TestController);
  appTest.addClass(ServerConfig);
  await appTest.buildAndStart();

  const response = await appTest.supertest().get('/').expect(500);
  expect(spyE.calledOnce).toBe(true);
  expect(spyD.calledOnce).toBe(true);
  expect(response).toMatchSnapshot();
  expect(result).toMatchSnapshot();
});
