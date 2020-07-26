import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class NotImplementedException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.NOT_IMPLEMENTED],
    otherFields = {}
  ) {
    super(message, HttpStatus.NOT_IMPLEMENTED, error, otherFields);
  }
}
