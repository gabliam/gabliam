import { Joi } from '@gabliam/core';
import { Controller, Get, Post, Validate } from '@gabliam/web-core';
import * as supertest from 'supertest';
import { express as e } from '../../src';
import { ExpressPluginTest } from '../express-plugin-test';

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
        async getTest(req: e.Request, res: e.Response) {
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
        async getTest(req: e.Request, res: e.Response) {
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
        async getTest(req: e.Request, res: e.Response) {
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
        async getTest(req: e.Request, res: e.Response) {
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
              'secret-header': Joi.string().default('@@@@@@'),
            },
          },
          { allowUnknown: true }
        )
        async getTest(req: e.Request, res: e.Response) {
          delete req.headers.host; // this can change computer to computer, so just remove it
          expect(req.headers).toMatchSnapshot();
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
        @Get('/user/:id')
        @Validate({
          params: {
            id: Joi.string().uppercase(),
          },
        })
        async getTest(req: e.Request, res: e.Response) {
          expect(req.params.id).toBe('ADAM');
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/user/adam')
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
          }),
        })
        async getTest(req: e.Request, res: e.Response) {
          expect(req.query).toEqual({
            name: 'JOHN',
            page: 1,
          });
          return 'k';
        }
      }

      appTest.addClass(TestController);
      await appTest.build();
      const response = await supertest(appTest.app)
        .get('/?name=john')
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
          },
        })
        async getTest(req: e.Request, res: e.Response) {
          expect(req.body).toEqual({
            first: 'john',
            role: 'ADMIN',
            last: 'Smith',
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
