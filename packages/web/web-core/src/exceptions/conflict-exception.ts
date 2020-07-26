import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class ConflictException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.CONFLICT],
    otherFields = {}
  ) {
    super(message, HttpStatus.CONFLICT, error, otherFields);
  }
}
