import { Service } from '@gabliam/core';
import {
  HttpStatus,
  Interceptor,
  Next,
  nextFn,
  ResponseEntity,
} from '@gabliam/web-core';
import { ValidationError } from '../errors';

@Service()
export class ValidateSendErrorInterceptor implements Interceptor {
  async intercept(@Next() next: nextFn) {
    try {
      await next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return new ResponseEntity(err.toJSON(), HttpStatus.BAD_REQUEST);
      } else {
        throw err;
      }
    }
  }
}
