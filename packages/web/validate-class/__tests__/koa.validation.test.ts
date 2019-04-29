import KoaPlugin from '@gabliam/koa';
import {
  RestController,
  Get,
  RequestHeaders,
  RequestParam,
  QueryParam,
  RequestBody,
  Post,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/lib/testing';
import { Validate } from '../src';
import { Header, Header2 } from './fixtures/header';
import { Params, Params2 } from './fixtures/params';
import { Query, Query2 } from './fixtures/query';
import { Body, Body2 } from './fixtures/body';

let appTest: WebPluginTest;

beforeEach(async () => {
  appTest = new WebPluginTest([KoaPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

describe('express integration', () => {
  describe('validations', () => {
    it('req.headers', async () => {
      @RestController('/')
      class TestController {
        @Get('/')
        async getTest(@RequestHeaders() @Validate() header: Header) {
          return 'lol';
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/')
        .set('Accept', 'application/json')
        .expect(400);
      expect(response).toMatchSnapshot();
    });

    it('req.params', async () => {
      @RestController('/')
      class TestController {
        @Get('/user/:id')
        async getTest(@RequestParam() @Validate() params: Params) {
          return 'lol';
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/user/@@')
        .expect(400);
      expect(response).toMatchSnapshot();
    });

    it('req.query', async () => {
      @RestController('/')
      class TestController {
        @Get('/')
        async getTest(@QueryParam() @Validate() query: Query) {
          return 'lol';
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/?end=lol')
        .expect(400);
      expect(response).toMatchSnapshot();
    });

    it('req.body', async () => {
      @RestController('/')
      class TestController {
        @Post('/')
        async getTest(@RequestBody() @Validate() body: Body) {
          return 'lol';
        }
      }

      appTest.addClass(TestController);

      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .post('/')
        .send({
          first: 'john',
          last: 123,
        })
        .expect(400);
      expect(response).toMatchSnapshot();
    });
  });

  describe('update req values', () => {
    it('req.headers', async () => {
      @RestController('/')
      class TestController {
        @Get('/')
        async getTest(@RequestHeaders() @Validate() headers: Header2) {
          delete (<any>headers).host; // this can change computer to computer, so just remove it
          expect(headers).toMatchSnapshot();
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/')
        .set('Accept', 'application/json')
        .expect(200);
      expect(response).toMatchSnapshot();
    });

    it('req.params', async () => {
      @RestController('/')
      class TestController {
        @Get('/:id/user/:name')
        async getTest(@RequestParam() @Validate() param: Params2) {
          expect(param.id).toBe(12);
          expect(param.name).toBe('ADAM');
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/12/user/adam')
        .expect(200);
      expect(response).toMatchSnapshot();
    });

    it('req.query', async () => {
      @RestController('/')
      class TestController {
        @Get('/')
        async getTest(@QueryParam() @Validate() query: Query2) {
          expect(query).toEqual({
            name: 'JOHN',
            page: 1,
            id: 42,
          });
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/?name=john&id=42')
        .expect(200);
      expect(response).toMatchSnapshot();
    });

    it('req.body', async () => {
      @RestController('/')
      class TestController {
        @Post('/')
        async getTest(@RequestBody() @Validate() body: Body2) {
          expect(body).toEqual({
            first: 'john',
            role: 'ADMIN',
            last: 'Smith',
            id: 42,
          });
          return 'lol';
        }
      }

      appTest.addClass(TestController);

      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .post('/?end=lol')
        .send({
          first: 'john',
          role: 'admin',
        })
        .expect(200);
      expect(response).toMatchSnapshot();
    });
  });
});
