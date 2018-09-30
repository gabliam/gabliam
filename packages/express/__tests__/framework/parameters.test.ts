import {
  Controller,
  Get,
  RequestParam,
  Request,
  Response,
  QueryParam,
  Post,
  RequestBody,
  RequestHeaders,
  Cookies,
  Next,
  GabRequest,
  GabResponse,
  WebConfig,
} from '@gabliam/web-core';
import { ExpressPluginTest } from '../express-plugin-test';
import { express as e } from '../../src';
import * as supertest from 'supertest';
import * as sinon from 'sinon';
import { Config } from '@gabliam/core';

let appTest: ExpressPluginTest;

beforeEach(async () => {
  appTest = new ExpressPluginTest();
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
    await appTest.build();
    const response = await supertest(appTest.app)
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
    await appTest.build();
    const response = await supertest(appTest.app)
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
    const response = await supertest(appTest.app)
      .get('/42')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the request object', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@Request() req: GabRequest) {
        return req.params.id;
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app)
      .get('/GET')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the response object', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@Response() res: GabResponse) {
        return res.originalResponse.send('foo');
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app)
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
    const response = await supertest(appTest.app)
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
    const response = await supertest(appTest.app)
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
    await appTest.build();
    const response = await supertest(appTest.app)
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
    const response = await supertest(appTest.app)
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
        if (cookie) {
          return cookie;
        } else {
          return ':(';
        }
      }
    }

    @Config()
    class ServiceConfig {
      @WebConfig()
      ServerConfig(app: e.Application) {
        app.use((req, res, nextFunc) => {
          res.cookie('cookie', 'hey');
          nextFunc();
        });
      }
    }

    appTest.addClass(ServiceConfig);
    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app)
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the next function', async () => {
    const spy = sinon.spy();

    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@Next() nextFunc: any) {
        spy();
        return nextFunc();
      }

      @Get('/')
      public getResult() {
        return 'foo';
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app)
      .get('/')
      .expect(200);
    expect(spy.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });
});
