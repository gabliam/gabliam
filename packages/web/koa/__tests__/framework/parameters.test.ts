import {
  Controller,
  Cookies,
  Get,
  Next,
  Post,
  QueryParam,
  Request,
  RequestBody,
  RequestHeaders,
  RequestParam,
  Response,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import * as sinon from 'sinon';
import KoaPlugin, { koa, koaRouter } from '../../src/index';

let appTest: WebPluginTest;

beforeEach(async () => {
  appTest = new WebPluginTest([KoaPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Parameters:', () => {
  test('bug parameter when value is number and passed 0', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@RequestParam('id') id: number) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();
    const response = await appTest
      .supertest()
      .get('/0')
      .expect(200);

    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the url parameter of the web request', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@RequestParam('id') id: string) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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

    appTest.addClass(TestController);
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
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
      public getCookie(@Cookies('cookie') cookie: any) {
        // console.log('cookie', cookie)
        if (cookie) {
          return cookie;
        } else {
          return ':(';
        }
      }
    }

    appTest.addClass(TestController);
    await appTest.buildAndStart();
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
    await appTest.buildAndStart();
    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spy.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });
});
