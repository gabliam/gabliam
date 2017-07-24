import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Head,
  Delete,
  All,
  ExpressConfig
} from '../../src/index';
import * as e from 'express';
import { ExpressPluginTest } from '../express-plugin-test';
import * as supertest from 'supertest';
import { Config } from '@gabliam/core';
import * as sinon from 'sinon';

let appTest: ExpressPluginTest;

beforeEach(async () => {
  appTest = new ExpressPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Middleware:', () => {
  let result: string;
  const middleware: any = {
    a: function(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
      result += 'a';
      nextFunc();
    },
    b: function(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
      result += 'b';
      nextFunc();
    },
    c: function(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
      result += 'c';
      nextFunc();
    }
  };
  const spyA = sinon.spy(middleware, 'a');
  const spyB = sinon.spy(middleware, 'b');
  const spyC = sinon.spy(middleware, 'c');

  beforeEach(() => {
    result = '';
    spyA.reset();
    spyB.reset();
    spyC.reset();
  });

  test('should call method-level middleware correctly (GET)', async () => {
    @Controller('/')
    class TestController {
      @Get('/', spyA, spyB, spyC)
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }
    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);

    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (POST)', async () => {
    @Controller('/')
    class TestController {
      @Post('/', spyA, spyB, spyC)
      public postTest(req: e.Request, res: e.Response) {
        res.send('POST');
      }
    }

    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).post('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (PUT)', async () => {
    @Controller('/')
    class TestController {
      @Put('/', spyA, spyB, spyC)
      public postTest(req: e.Request, res: e.Response) {
        res.send('PUT');
      }
    }
    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).put('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (PATCH)', async () => {
    @Controller('/')
    class TestController {
      @Patch('/', spyA, spyB, spyC)
      public postTest(req: e.Request, res: e.Response) {
        res.send('PATCH');
      }
    }

    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).patch('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (HEAD)', async () => {
    @Controller('/')
    class TestController {
      @Head('/', spyA, spyB, spyC)
      public postTest(req: e.Request, res: e.Response) {
        res.send('HEAD');
      }
    }
    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).head('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (DELETE)', async () => {
    @Controller('/')
    class TestController {
      @Delete('/', spyA, spyB, spyC)
      public postTest(req: e.Request, res: e.Response) {
        res.send('DELETE');
      }
    }
    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).delete('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (ALL)', async () => {
    @Controller('/')
    class TestController {
      @All('/', spyA, spyB, spyC)
      public postTest(req: e.Request, res: e.Response) {
        res.send('ALL');
      }
    }
    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call controller-level middleware correctly', async () => {
    @Controller({
      path: '/',
      middlewares: [spyA, spyB, spyC]
    })
    class TestController {
      @Get('/')
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }

    appTest.addClass(TestController);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call server-level middleware correctly', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }

    @Config()
    class ServerConfig {
      @ExpressConfig()
      serverConfig(app: e.Application) {
        app.use(spyA);
        app.use(spyB);
        app.use(spyC);
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call all middleware in correct order', async () => {
    @Controller({
      path: '/',
      middlewares: [spyB]
    })
    class TestController {
      @Get('/', spyC)
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }

    @Config()
    class ServerConfig {
      @ExpressConfig()
      serverConfig(app: e.Application) {
        app.use(spyA);
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should resolve controller-level middleware', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller({
      path: '/',
      middlewares: [symbolId, strId]
    })
    class TestController {
      @Get('/')
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind<e.RequestHandler>(symbolId)
      .toConstantValue(spyA);
    appTest.gab.container.bind<e.RequestHandler>(strId).toConstantValue(spyB);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should resolve method-level middleware', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller('/')
    class TestController {
      @Get('/', symbolId, strId)
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind<e.RequestHandler>(symbolId)
      .toConstantValue(spyA);
    appTest.gab.container.bind<e.RequestHandler>(strId).toConstantValue(spyB);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should compose controller- and method-level middleware', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller({
      path: '/',
      middlewares: [symbolId]
    })
    class TestController {
      @Get('/', strId)
      public getTest(req: e.Request, res: e.Response) {
        res.send('GET');
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind<e.RequestHandler>(symbolId)
      .toConstantValue(spyA);
    appTest.gab.container.bind<e.RequestHandler>(strId).toConstantValue(spyB);
    await appTest.start();

    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });
});
