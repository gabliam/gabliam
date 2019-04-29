import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class UnauthorizedException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses[HttpStatus.UNAUTHORIZED],
    otherFields = {}
  ) {
    super(message, HttpStatus.UNAUTHORIZED, error, otherFields);
  }
}
