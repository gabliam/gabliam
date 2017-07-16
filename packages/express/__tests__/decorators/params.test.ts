import {
  Request,
  Response,
  RequestParam,
  QueryParam,
  RequestBody,
  RequestHeaders,
  Cookies,
  Next,
  Get,
  Post
} from '../../src/decorators';

import { ControllerParameterMetadata } from '../../src/interfaces';
import { METADATA_KEY } from '../../src/constants';

describe('params decorators', () => {
  test('should add parameter metadata to a class when decorated with @params', () => {
    const middleware = [
      function() {
        return;
      }
    ];

    class TestController {
      @Get('/foo/:id', ...middleware)
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
    const methodMetadataList: ControllerParameterMetadata = Reflect.getMetadata(
      METADATA_KEY.controllerParameter,
      TestController
    );
    expect(methodMetadataList).toMatchSnapshot();
  });
});
