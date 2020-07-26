import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class ImATeapotException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.IM_A_TEAPOT],
    otherFields = {}
  ) {
    super(message, HttpStatus.IM_A_TEAPOT, error, otherFields);
  }
}
