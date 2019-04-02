import { Joi } from '@gabliam/core';
import {
  Controller,
  Get,
  Post,
  QueryParam,
  RequestBody,
  RequestHeaders,
  RequestParam,
} from '@gabliam/web-core';
import * as supertest from 'supertest';
import { Validate } from '../src';
import { ExpressPluginTest } from './express-plugin-test';

let appTest: ExpressPluginTest;

beforeEach(async () => {
  appTest = new ExpressPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('express integration', () => {
  describe('validations', () => {
    it('req.headers', async () => {
      @Controller('/')
      class TestController {
        @Get('/')
        @Validate(
          {
            headers: {
              accept: Joi.string().regex(/xml/),
            },
          },
          { allowUnknown: true }
        )
        async getTest() {
          return 'lol';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(400);
      expect(response).toMatchSnapshot();
    });

    it('req.params', async () => {
      @Controller('/')
      class TestController {
        @Get('/user/:id')
        @Validate({
          params: {
            id: Joi.string().token(),
          },
        })
        async getTest() {
          return 'lol';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/user/@@')
        .expect(400);
      expect(response).toMatchSnapshot();
    });

    it('req.query', async () => {
      @Controller('/')
      class TestController {
        @Get('/')
        @Validate({
          query: Joi.object().keys({
            start: Joi.date(),
          }),
        })
        async getTest() {
          return 'lol';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/?end=lol')
        .expect(400);
      expect(response).toMatchSnapshot();
    });

    it('req.body', async () => {
      @Controller('/')
      class TestController {
        @Post('/')
        @Validate({
          body: {
            first: Joi.string().required(),
            last: Joi.string(),
            role: Joi.number().integer(),
          },
        })
        async getTest() {
          return 'lol';
        }
      }

      appTest.addClass(TestController);

      await appTest.build();
      const response = await supertest(appTest.app)
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
      @Controller('/')
      class TestController {
        @Get('/')
        @Validate(
          {
            headers: {
              accept: Joi.string().regex(/json/),
              id: Joi.number().default(12),
              'secret-header': Joi.string().default('@@@@@@'),
            },
          },
          { allowUnknown: true }
        )
        async getTest(@RequestHeaders() headers: { [k: string]: any }) {
          delete headers.host; // this can change computer to computer, so just remove it
          expect(headers).toMatchSnapshot();
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200);
      expect(response).toMatchSnapshot();
    });

    it('req.params', async () => {
      @Controller('/')
      class TestController {
        @Get('/:id/user/:name')
        @Validate({
          params: {
            id: Joi.number(),
            name: Joi.string().uppercase(),
          },
        })
        async getTest(
          @RequestParam('id') id: number,
          @RequestParam('name') name: string
        ) {
          expect(id).toBe(12);
          expect(name).toBe('ADAM');
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/12/user/adam')
        .expect(200);
      expect(response).toMatchSnapshot();
    });

    it('req.query', async () => {
      @Controller('/')
      class TestController {
        @Get('/')
        @Validate({
          query: Joi.object().keys({
            name: Joi.string().uppercase(),
            page: Joi.number().default(1),
            id: Joi.number().required(),
          }),
        })
        async getTest(@QueryParam() query: any) {
          expect(query).toEqual({
            name: 'JOHN',
            page: 1,
            id: 42,
          });
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/?name=john&id=42')
        .expect(200);
      expect(response).toMatchSnapshot();
    });

    it('req.body', async () => {
      @Controller('/')
      class TestController {
        @Post('/')
        @Validate({
          body: {
            first: Joi.string().required(),
            last: Joi.string().default('Smith'),
            role: Joi.string().uppercase(),
            id: Joi.number().default(42),
          },
        })
        async getTest(@RequestBody() body: any) {
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

      await appTest.build();
      const response = await supertest(appTest.app)
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
