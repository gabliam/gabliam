import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class RequestTooLongException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.REQUEST_TOO_LONG],
    otherFields = {}
  ) {
    super(message, HttpStatus.REQUEST_TOO_LONG, error, otherFields);
  }
}
