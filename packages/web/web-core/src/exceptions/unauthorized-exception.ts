import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class UnauthorizedException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.UNAUTHORIZED],
    otherFields = {}
  ) {
    super(message, HttpStatus.UNAUTHORIZED, error, otherFields);
  }
}
