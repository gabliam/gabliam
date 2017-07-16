import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Head,
  Delete,
  Method
} from '../src/index';
import * as e from 'express';
import { ExpressPluginTest } from './express-plugin-test';
import * as supertest from 'supertest';

let appTest: ExpressPluginTest;

beforeEach(async () => {
  appTest = new ExpressPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

test('should work for async controller methods', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    async getTest(req: e.Request, res: e.Response) {
      return new Promise(resolve => {
        setTimeout(resolve, 100, 'GET');
      });
    }
  }
  appTest.addClass(TestController);
  await appTest.start();
  const response = await supertest(appTest.app).get('/').expect(200);
  expect(response).toMatchSnapshot();
});

test('should work for async controller methods that fails', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(req: e.Request, res: e.Response) {
      return new Promise((resolve, reject) => {
        setTimeout(reject, 100, 'GET');
      });
    }
  }
  appTest.addClass(TestController);
  await appTest.start();
  const response = await supertest(appTest.app).get('/').expect(500);
  expect(response).toMatchSnapshot();
});

test('should work for methods which call nextFunc()', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
      nextFunc();
    }

    @Get('/')
    public getTest2(req: e.Request, res: e.Response) {
      return 'GET';
    }
  }

  appTest.addClass(TestController);
  await appTest.start();
  const response = await supertest(appTest.app).get('/').expect(200);
  expect(response).toMatchSnapshot();
});

test('should work for async methods which call nextFunc()', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
      return new Promise(resolve => {
        setTimeout(
          () => {
            nextFunc();
            resolve();
          },
          100,
          'GET'
        );
      });
    }

    @Get('/')
    public getTest2(req: e.Request, res: e.Response) {
      return 'GET';
    }
  }
  appTest.addClass(TestController);
  await appTest.start();
  const response = await supertest(appTest.app).get('/').expect(200);
  expect(response).toMatchSnapshot();
});

test('should work for async methods called by nextFunc()', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
      nextFunc();
    }

    @Get('/')
    public getTest2(req: e.Request, res: e.Response) {
      return new Promise(resolve => {
        setTimeout(resolve, 100, 'GET');
      });
    }
  }
  appTest.addClass(TestController);
  await appTest.start();
  const response = await supertest(appTest.app).get('/').expect(200);
  expect(response).toMatchSnapshot();
});

test('should work for each shortcut decorator', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(req: e.Request, res: e.Response) {
      res.send('GET');
    }
    @Post('/')
    public postTest(req: e.Request, res: e.Response) {
      res.send('POST');
    }
    @Put('/')
    public putTest(req: e.Request, res: e.Response) {
      res.send('PUT');
    }
    @Patch('/')
    public patchTest(req: e.Request, res: e.Response) {
      res.send('PATCH');
    }
    @Head('/')
    public headTest(req: e.Request, res: e.Response) {
      res.send('HEAD');
    }
    @Delete('/')
    public deleteTest(req: e.Request, res: e.Response) {
      res.send('DELETE');
    }
  }
  appTest.addClass(TestController);
  await appTest.start();
  const agent = supertest(appTest.app);

  const rd = await agent.delete('/').expect(200);
  expect(rd).toMatchSnapshot();

  const rh = await agent.head('/').expect(200);
  expect(rh).toMatchSnapshot();

  const rpatch = await agent.patch('/').expect(200);
  expect(rpatch).toMatchSnapshot();

  const rput = await agent.put('/').expect(200);
  expect(rput).toMatchSnapshot();

  const rpost = await agent.post('/').expect(200);
  expect(rpost).toMatchSnapshot();

  const rget = await agent.get('/').expect(200);
  expect(rget).toMatchSnapshot();
});

it('should work for more obscure HTTP methods using the httpMethod decorator', async () => {
  @Controller('/')
  class TestController {
    @Method('propfind', '/')
    public getTest(req: e.Request, res: e.Response) {
      res.send('PROPFIND');
    }
  }

  appTest.addClass(TestController);
  await appTest.start();

  const response = await supertest(appTest.app).propfind('/').expect(200);
  expect(response).toMatchSnapshot();
});

it('should use returned values as response', async () => {
  @Controller('/')
  class TestController {
    @Get('/')
    public getTest(req: e.Request, res: e.Response) {
      return { hello: 'world' };
    }
  }

  appTest.addClass(TestController);
  await appTest.start();

  const response = await supertest(appTest.app).get('/').expect(200);
  expect(response).toMatchSnapshot();
});
