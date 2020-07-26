import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class InternalServerErrorException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.INTERNAL_SERVER_ERROR],
    otherFields = {}
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, error, otherFields);
  }
}
