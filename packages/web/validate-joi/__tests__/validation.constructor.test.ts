import { Joi, ValueExtractor } from '@gabliam/core';
import ExpressPlugin from '@gabliam/express';
import KoaPlugin from '@gabliam/koa';
import { Controller, Get, RestController } from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import { Validate, Validator, ValidatorOptionsConstructor } from '../src';

let appTest: WebPluginTest;

[
  {
    name: 'express',
    plugin: ExpressPlugin,
  },
  {
    name: 'koa',
    plugin: KoaPlugin,
  },
].forEach((plugin) => {
  describe(`${plugin.name} integration`, () => {
    beforeEach(async () => {
      appTest = new WebPluginTest([plugin.plugin]);
      appTest.addConf('app.accept', /xml/);
    });

    afterEach(async () => {
      await appTest.destroy();
    });

    [
      {
        name: 'RestController',
        deco: RestController,
      },
      {
        name: 'Controller',
        deco: Controller,
      },
    ].forEach((decorator) => {
      describe(`${decorator.name} validations constructor`, () => {
        const construct = (
          value: ValueExtractor,
        ): Validator | ValidatorOptionsConstructor => ({
          validator: {
            headers: {
              accept: Joi.string().regex(value('app.accept', 'json')),
            },
          },
          options: { allowUnknown: true },
        });

        it('req.headers', async () => {
          @decorator.deco('/')
          class TestController {
            @Get('/')
            @Validate(construct)
            async getTest() {
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
          if (decorator.name === 'Controller') {
            expect(response.status).toBe(400);
            expect(response.text).toBeDefined();
          } else {
            expect(response).toMatchSnapshot();
          }

          const response2 = await appTest
            .supertest()
            .get('/')
            .set('Accept', 'application/json')
            .expect(400);
          if (decorator.name === 'Controller') {
            expect(response2.status).toBe(400);
            expect(response2.text).toBeDefined();
          } else {
            expect(response2).toMatchSnapshot();
          }
        });
      });
    });
  });
});
