import { ConsumeOptions, SendOptions } from './amqp';
import { PARAMETER_TYPE } from '../constants';

export type HandlerType = 'Listener' | 'Consumer';

export interface RabbitHandlerMetadata {
  queue: string;

  type: HandlerType;

  consumeOptions?: ConsumeOptions;

  sendOptions?: SendOptions;

  sendOptionsError?: SendOptions;

  key: string;
}

/**
 * Represent all parameters metadata for a controller
 */
export type RabbitHandlerParameterMetadata = Map<
  string | symbol,
  ParameterMetadata[]
>;

/**
 * Parameter metadata
 */
export interface ParameterMetadata {
  /**
   * Parameter name
   */
  parameterName: string;

  /**
   * Index of the parameter
   */
  index: number;

  /**
   * Type of parameter
   */
  type: PARAMETER_TYPE;
}
