import { makeParamDecorator } from '@gabliam/core';
import { Message as MessageAmqp } from 'amqplib';
import { get } from 'lodash';
import { METADATA_KEY } from '../constants';

export type HandlerFn = (args: any, msg: MessageAmqp, content: any) => any;

export interface RabbitParamDecorator<T = any> {
  handler: HandlerFn;

  args: T[];
}

export const makeRabbitParamDecorator = (handler: HandlerFn) => {
  return makeParamDecorator(
    METADATA_KEY.RabbitcontrollerParameter,
    (...args: any[]): RabbitParamDecorator => ({ args, handler })
  );
};

/**
 * Type of the `Message` decorator / constructor function.
 */
export interface MessageDecorator {
  /**
   * Decorator that marks a parameter to inject Message
   *
   * @usageNotes
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Message() msg: MessageAmqp) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   */
  (): ParameterDecorator;

  /**
   * see the `@Message` decorator.
   */
  new (): any;
}

export const Message: MessageDecorator = makeRabbitParamDecorator(
  (args, msg) => msg
);

/**
 * Type of the `Content` decorator / constructor function.
 */
export interface ContentDecorator {
  /**
   * Decorator that marks a parameter to inject Content or a part of Content
   *
   * You can supply an optional path to extract a part of Content.
   * Under the hood, use lodash.get
   *
   * @usageNotes
   *
   * Example with full Content
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Content() content: any) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   *
   * Example with part of content
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Content('test.user') content: any) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Content` decorator.
   */
  new (path?: string): any;
}

export const Content: ContentDecorator = makeRabbitParamDecorator(
  ([path]: [string | undefined], msg, content) => {
    if (path) {
      return get(content, path);
    }
    return content;
  }
);

/**
 * Type of the `Properties` decorator / constructor function.
 */
export interface PropertiesDecorator {
  /**
   * Decorator that marks a parameter to inject Properties or a part of Properties
   *
   * You can supply an optional path to extract a part of Properties.
   * Under the hood, use lodash.get
   *
   * @usageNotes
   *
   * Example with full Properties
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Properties() properties: any) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   *
   * Example with part of Properties
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Properties('test.user') properties: any) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Properties` decorator.
   */
  new (path?: string): any;
}

export const Properties: PropertiesDecorator = makeRabbitParamDecorator(
  ([path]: [string | undefined], msg) => {
    if (path) {
      return get(msg.properties, path);
    }
    return msg.properties;
  }
);

/**
 * Type of the `Fields` decorator / constructor function.
 */
export interface FieldsDecorator {
  /**
   * Decorator that marks a parameter to inject Fields or a part of Fields
   *
   * You can supply an optional path to extract a part of Fields.
   * Under the hood, use lodash.get
   *
   * @usageNotes
   *
   * Example with full Fields
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Fields() fields: any) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   *
   * Example with part of Fields
   *
   * ```typescript
   * @CUnit('test')
   * @RabbitController('/')
   * class SampleController {
   *    @RabbitConsumer('test')
   *    hello(@Fields('test.user') fields: any) {
   *      console.log('Hello');
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Fields` decorator.
   */
  new (path?: string): any;
}

export const Fields: FieldsDecorator = makeRabbitParamDecorator(
  ([path]: [string | undefined], msg) => {
    if (path) {
      return get(msg.fields, path);
    }
    return msg.fields;
  }
);
