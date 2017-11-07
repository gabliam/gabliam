import {
  Controller,
  Get,
  RequestParam,
  Request,
  Response,
  QueryParam,
  Post,
  RequestBody,
  KoaConfig,
  RequestHeaders,
  Cookies,
  koa,
  koaRouter,
  Next
} from '../../src/index';
import { KoaPluginTest } from '../koa-plugin-test';
import { Config } from '@gabliam/core';
import * as sinon from 'sinon';
const koaBody = require('koa-body');

let appTest: KoaPluginTest;

beforeEach(async () => {
  appTest = new KoaPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Parameters:', () => {
  test('should bind a method parameter to the url parameter of the web request', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/foo')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the url parameter of the web request and cast to number', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@RequestParam('id') id: number) {
        return [typeof id, id];
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/42')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the ctx object', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(ctx: koaRouter.IRouterContext) {
        return ctx.params.id;
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/GET')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the Request object', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@Request() req: koa.Request) {
        return req.url;
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/GET')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the response object', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@Response() res: koa.Response) {
        res.body = 'foo';
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to a query parameter', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@QueryParam('id') id: string) {
        return id;
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/')
      .query('id=lolilol')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to a query parameter and cast to number', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@QueryParam('id') id: number) {
        return [typeof id, id];
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/')
      .query('id=12')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the request body', async () => {
    @Controller('/')
    class TestController {
      @Post('/')
      public getTest(@RequestBody() reqBody: string) {
        return reqBody;
      }
    }

    @Config()
    class ServerConfig {
      @KoaConfig()
      serverConfig(app: koa) {
        app.use(
          koaBody({
            jsonLimit: '1kb'
          })
        );
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.build();
    const response = await appTest
      .supertest()
      .post('/')
      .send({ foo: 'bar' })
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the request headers', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@RequestHeaders('testhead') headers: any) {
        return headers;
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/')
      .set('TestHead', 'fooTestHead')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to a cookie', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getCookie(
        @Cookies('cookie') cookie: any,
        ctx: koaRouter.IRouterContext
      ) {
        // console.log('cookie', cookie)
        if (cookie) {
          ctx.body = cookie;
        } else {
          ctx.body = ':(';
        }
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/')
      .set('Cookie', 'cookie=hey')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the next function', async () => {
    const spy = sinon.spy();

    @Controller('/')
    class TestController {
      @Get('/')
      public async getTest(@Next() nextFunc: any) {
        spy();
        await nextFunc();
      }

      @Get('/')
      public getResult() {
        return 'foo';
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spy.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });
});
