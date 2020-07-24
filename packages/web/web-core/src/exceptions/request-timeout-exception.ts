import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class RequestTimeoutException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.REQUEST_TIMEOUT],
    otherFields = {}
  ) {
    super(message, HttpStatus.REQUEST_TIMEOUT, error, otherFields);
  }
}
