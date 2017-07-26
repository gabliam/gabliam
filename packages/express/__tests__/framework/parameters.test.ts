import {
  Controller,
  Get,
  RequestParam,
  Request,
  Response,
  QueryParam,
  Post,
  RequestBody,
  ExpressConfig,
  RequestHeaders,
  Cookies,
  Next
} from '../../src/index';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
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

describe('Parameters:', () => {
  test('should bind a method parameter to the url parameter of the web request', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(
        @RequestParam('id') id: string,
        req: e.Request,
        res: e.Response
      ) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app).get('/foo').expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the request object', async () => {
    @Controller('/')
    class TestController {
      @Get(':id')
      public getTest(@Request() req: e.Request) {
        return req.params.id;
      }
    }
    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app).get('/GET').expect(200);
    expect(response).toMatchSnapshot();
  });

  test('should bind a method parameter to the response object', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(@Response() res: e.Response) {
        return res.send('foo');
      }
    }

    appTest.addClass(TestController);
    await appTest.build();
    const response = await supertest(appTest.app).get('/').expect(200);
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
      @ExpressConfig()
      serverConfig(app: e.Application) {
        app.use(bodyParser.json());
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
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
      public getCookie(
        @Cookies('cookie') cookie: any,
        req: e.Request,
        res: e.Response
      ) {
        if (cookie) {
          res.send(cookie);
        } else {
          res.send(':(');
        }
      }
    }

    @Config()
    class ServerConfig {
      @ExpressConfig()
      serverConfig(app: e.Application) {
        app.use(cookieParser());
        app.use(function(req, res, nextFunc) {
          res.cookie('cookie', 'hey');
          nextFunc();
        });
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.build();
    const response = await supertest(appTest.app).get('/').expect(200);
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
    const response = await supertest(appTest.app).get('/').expect(200);
    expect(spy.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });
});
