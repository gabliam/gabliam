import { Service } from '@gabliam/core';
import {
  Controller,
  Get,
  Pipe,
  RequestParam,
  Interceptor,
  Next,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import * as sinon from 'sinon';
import KoaPlugin, { toInterceptor } from '../../src';

let appTest: WebPluginTest;

afterEach(async () => {
  await appTest.destroy();
});

describe('globalPipes', () => {
  @Service()
  class A implements Pipe {
    transform(value: any) {
      return (value += 'a');
    }
  }

  @Service()
  class B implements Pipe {
    transform(value: any) {
      return (value += 'b');
    }
  }

  @Controller('/')
  class TestController {
    @Get('/:id')
    public getTest(@RequestParam('id') id: string) {
      return id;
    }
  }

  const spyA = sinon.spy(A.prototype, 'transform');
  const spyB = sinon.spy(B.prototype, 'transform');

  beforeEach(() => {
    spyA.resetHistory();
    spyB.resetHistory();
  });

  test('should call global-level pipe correctly', async () => {
    appTest = new WebPluginTest([
      new KoaPlugin({
        globalPipes: [A, B],
      }),
    ]);
    appTest.addClass(TestController);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/lol')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
  });
});

describe('GlobalInterceptor', () => {
  let result: string;

  @Service()
  class A implements Interceptor {
    async intercept(@Next() next: () => Promise<any>) {
      result += 'a';
      await next();
    }
  }

  async function b(ctx: any, nextFunc: () => Promise<any>) {
    result += 'b';
    await nextFunc();
  }

  const B = toInterceptor(b);

  @Service()
  class C implements Interceptor {
    async intercept() {
      result += 'c';
    }
  }

  const spyA = sinon.spy(A.prototype, 'intercept');
  const spyB = sinon.spy(B.prototype, 'intercept');
  const spyC = sinon.spy(C.prototype, 'intercept');

  beforeEach(() => {
    result = '';
    spyA.resetHistory();
    spyB.resetHistory();
    spyC.resetHistory();
  });

  @Controller('/')
  class TestController {
    @Get('/')
    public getTest() {
      return 'GET';
    }
  }

  test('should call global-level interceptor correctly', async () => {
    appTest = new WebPluginTest([
      new KoaPlugin({
        globalInterceptors: [A, B, C],
      }),
    ]);

    appTest.addClass(TestController);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });
});
