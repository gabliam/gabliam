import { Config } from '@gabliam/core';
import {
  Controller,
  Get,
  WebConfig,
  WebConfigAfterControllers,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import sinon from 'sinon';
import ExpressConfig, { express as e } from '../../src';

let appTest: WebPluginTest;
let result: string;
const middleware: any = {
  a(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
    result += 'a';
    nextFunc();
  },
  b(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
    result += 'b';
    nextFunc();
  },
  c(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
    result += 'c';
    nextFunc();
  },
  e(error: any, req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
    result += 'e';
    res.status(500).send('error');
  },
  d(error: any, req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
    result += 'd';
    nextFunc(error);
  },
};
const spyA = sinon.spy(middleware, 'a');
const spyB = sinon.spy(middleware, 'b');
const spyC = sinon.spy(middleware, 'c');
const spyE = sinon.spy(middleware, 'e');
const spyD = sinon.spy(middleware, 'd');

beforeEach(async () => {
  result = '';
  spyA.resetHistory();
  spyB.resetHistory();
  spyC.resetHistory();
  spyE.resetHistory();
  spyD.resetHistory();
  appTest = new WebPluginTest([ExpressConfig]);
});

afterEach(async () => {
  await appTest.destroy();
});

test('@ExpressConfig', async () => {
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
    serverConfig(app: e.Application) {
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

test('@ExpressConfig Order', async () => {
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
    serverConfigC(app: e.Application) {
      app.use(spyC);
    }

    @WebConfig(100)
    serverConfigB(app: e.Application) {
      app.use(spyB);
    }

    @WebConfig(50)
    serverConfigA(app: e.Application) {
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
    public getTest() {
      throw new Error();
    }
  }

  @Config()
  class ServerConfig {
    @WebConfigAfterControllers()
    serverConfig(app: e.Application) {
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
    public getTest() {
      throw new Error();
    }
  }

  @Config()
  class ServerConfig {
    @WebConfigAfterControllers(100)
    serverConfig(app: e.Application) {
      app.use(spyE);
    }

    @WebConfigAfterControllers(50)
    serverConfigD(app: e.Application) {
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
