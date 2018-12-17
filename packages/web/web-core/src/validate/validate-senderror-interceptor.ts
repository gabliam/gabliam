import { Service } from '@gabliam/core';
import { Interceptor, Next } from '../decorators';
import { nextFn } from '../interface';
import { HttpStatus, ResponseEntity } from '../response-entity';
import { getValidateError, isValidateError } from './validate-request';

@Service()
export class ValidateSendErrorInterceptor implements Interceptor {
  async intercept(@Next() next: nextFn) {
    try {
      await next();
    } catch (err) {
      if (isValidateError(err)) {
        return new ResponseEntity(
          getValidateError(err),
          HttpStatus.BAD_REQUEST
        );
      } else {
        throw err;
      }
    }
  }
}
