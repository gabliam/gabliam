import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class GoneException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.GONE],
    otherFields = {}
  ) {
    super(message, HttpStatus.GONE, error, otherFields);
  }
}
