import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class ConflictException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses[HttpStatus.CONFLICT],
    otherFields = {}
  ) {
    super(message, HttpStatus.CONFLICT, error, otherFields);
  }
}
