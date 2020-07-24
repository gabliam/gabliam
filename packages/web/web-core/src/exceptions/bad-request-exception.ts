import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class BadRequestException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.BAD_REQUEST],
    otherFields = {}
  ) {
    super(message, HttpStatus.BAD_REQUEST, error, otherFields);
  }
}
