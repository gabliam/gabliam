import { reflection } from '@gabliam/core/src';
import {
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

describe('params decorators', () => {
  test('should add parameter metadata to a class when decorated with @params', () => {
    class TestController {
      @Get('/foo/:id')
      public test(
        @RequestParam('id') id: any,
        @QueryParam('cat') cat: any,
        @Request() req: any,
        @Response() res: any
      ) {
        return;
      }

      @Post('foo')
      public test2(@RequestBody('dog') dog: any) {
        return;
      }

      @Get('lol')
      public test3(
        @RequestHeaders('Auth') auth: any,
        @Cookies() cookies: any,
        @Next() next: any
      ) {
        return;
      }
    }

    expect(reflection.parameters(TestController, 'test')).toMatchSnapshot();
    expect(reflection.parameters(TestController, 'test2')).toMatchSnapshot();
    expect(reflection.parameters(TestController, 'test3')).toMatchSnapshot();
  });
});
