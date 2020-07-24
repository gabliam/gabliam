import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class NotAcceptableException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.NOT_ACCEPTABLE],
    otherFields = {}
  ) {
    super(message, HttpStatus.NOT_ACCEPTABLE, error, otherFields);
  }
}
