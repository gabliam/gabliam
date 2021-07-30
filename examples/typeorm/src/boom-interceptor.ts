import { Service } from '@gabliam/core';
import {
  ExecContext,
  ExecutionContext,
  GabResponse,
  Interceptor,
  Next,
  nextFn,
  Response,
  ResponseEntity,
} from '@gabliam/web-core';
import Boom from 'boom';

function isBoom(val: any): val is Boom<any> {
  return val && val.isBoom;
}

@Service()
export class BoomInterceptor implements Interceptor {
  async intercept(
    @Next() next: nextFn,
    @ExecContext() exec: ExecutionContext,
    @Response() res: GabResponse,
  ) {
    try {
      await next();
      return undefined;
    } catch (err) {
      if (isBoom(err)) {
        return new ResponseEntity(err.output.payload, err.output.statusCode);
      }

      // let default error handler of send error interceptor
      throw err;
    }
  }
}
