import { Type } from '../common';
import { ERRORS_MSGS } from '../constants';
import { DecoratorUniqError } from '../errors';

export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__parameters__';
export const PROP_METADATA = '__prop__metadata__';

export type AdditionalProcessingAnnotation<T> = (
  type: Type<T>,
  annotationInstance: any,
) => void;

export type AdditionalPropProcessing = (
  target: any,
  name: string,
  descriptor: TypedPropertyDescriptor<any>,
  annotationInstance: any,
) => void;

export type AdditionalParamProcessing = (
  target: any,
  name: string,
  index: number,
  annotationInstance: any,
) => void;

function createTypeDecorator<T = any>(
  name: string,
  uniq: boolean,
  uniqError: string,
  annotationInstance: any,
  additionalProcessingAnnotation?: AdditionalProcessingAnnotation<T>,
) {
  return function typeDecorator(cls: Type<T>) {
    // Use of Object.defineProperty is important since it creates non-enumerable property which
    // prevents the property is copied during subclassing.
    const annotations: any[] = Object.prototype.hasOwnProperty.call(
      cls,
      ANNOTATIONS,
    )
      ? (cls as any)[ANNOTATIONS]
      : (Object.defineProperty(cls, ANNOTATIONS, { value: [] }) as any)[
          ANNOTATIONS
        ];

    if (uniq && annotations.find((a) => a.gabMetadataName === name)) {
      throw new DecoratorUniqError(uniqError);
    }

    annotations.push(annotationInstance);

    if (additionalProcessingAnnotation) {
      additionalProcessingAnnotation(cls, annotationInstance);
    }

    return cls;
  };
}

function createPropDecorator(
  name: string,
  uniq: boolean,
  uniqError: string,
  decoratorInstance: any,
  additionalPropProcessing?: AdditionalPropProcessing,
) {
  return function PropDecorator(
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const constructor = target.constructor;
    // Use of Object.defineProperty is important since it creates non-enumerable property which
    // prevents the property is copied during subclassing.
    const meta: { [k: string]: any[] } = Object.prototype.hasOwnProperty.call(
      constructor,
      PROP_METADATA,
    )
      ? (constructor as any)[PROP_METADATA]
      : Object.defineProperty(constructor, PROP_METADATA, { value: {} })[
          PROP_METADATA
        ];
    meta[key] =
      (Object.prototype.hasOwnProperty.call(meta, key) && meta[key]) || [];

    if (uniq && meta[key].find((a) => a.gabMetadataName === name)) {
      throw new DecoratorUniqError(uniqError);
    }
    meta[key].unshift(decoratorInstance);

    if (additionalPropProcessing) {
      additionalPropProcessing(target, key, descriptor, decoratorInstance);
    }
  };
}

function createParamDecorator(
  annotationInstance: any,
  additionalParamProcessing?: AdditionalParamProcessing,
) {
  function ParamDecorator(target: any, propertyKey: any, index: number): any {
    const cls = target.constructor;
    // Use of Object.defineProperty is important since it creates non-enumerable property which
    // prevents the property is copied during subclassing.
    const parametersMap = Object.prototype.hasOwnProperty.call(cls, PARAMETERS)
      ? (cls as any)[PARAMETERS]
      : Object.defineProperty(cls, PARAMETERS, { value: {} })[PARAMETERS];

    // eslint-disable-next-line no-multi-assign
    const parameters = (parametersMap[propertyKey] =
      parametersMap[propertyKey] || []);

    // there might be gaps if some in between parameters do not have annotations.
    // we pad with nulls.
    while (parameters.length <= index) {
      parameters.push(null);
    }

    (parameters[index] = parameters[index] || []).push(annotationInstance);

    if (additionalParamProcessing) {
      additionalParamProcessing(target, propertyKey, index, annotationInstance);
    }

    return cls;
  }
  (<any>ParamDecorator).annotation = annotationInstance;
  return ParamDecorator;
}

function makeMetadataCtor(props?: (...args: any[]) => any): any {
  return function ctor(this: any, ...args: any[]) {
    if (props) {
      const values = props(...args);
      // eslint-disable-next-line guard-for-in
      for (const propName in values) {
        this[propName] = values[propName];
      }
    }
  };
}

/**
 * Create a decorator for class and Prop
 */
export function makePropAndAnnotationDecorator<T>(
  name: string,
  props?: (...args: any[]) => any,
  additionalProcessingAnnotation?: AdditionalProcessingAnnotation<T>,
  additionalPropProcessing?: AdditionalPropProcessing,
  uniq = false,
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR,
) {
  const metaCtor = makeMetadataCtor(props);
  function DecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof DecoratorFactory) {
      metaCtor.call(this, ...args);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this;
    }

    const annotationInstance = new (DecoratorFactory as any)(...args);

    return function decorator(
      target: any,
      key?: string,
      descriptor?: TypedPropertyDescriptor<any>,
    ) {
      if (key && descriptor) {
        return createPropDecorator(
          name,
          uniq,
          uniqError,
          annotationInstance,
          additionalPropProcessing,
        )(target, key, descriptor);
      }
      return createTypeDecorator(
        name,
        uniq,
        uniqError,
        annotationInstance,
        additionalProcessingAnnotation,
      )(target);
    };
  }

  DecoratorFactory.prototype.gabMetadataName = name;
  (DecoratorFactory as any).annotationCls = DecoratorFactory;
  return DecoratorFactory as any;
}

export function makeDecorator<T>(
  name: string,
  props?: (...args: any[]) => any,
  additionalProcessingAnnotation?: AdditionalProcessingAnnotation<T>,
  uniq = false,
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR,
): {
  new (...args: any[]): any;
  (...args: any[]): any;
  (...args: any[]): (cls: any) => any;
} {
  const metaCtor = makeMetadataCtor(props);

  function DecoratorFactory(this: any, ...args: any[]): (cls: Type<T>) => any {
    if (this instanceof DecoratorFactory) {
      metaCtor.call(this, ...args);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this;
    }

    const annotationInstance = new (DecoratorFactory as any)(...args);
    return createTypeDecorator(
      name,
      uniq,
      uniqError,
      annotationInstance,
      additionalProcessingAnnotation,
    );
  }

  DecoratorFactory.prototype.gabMetadataName = name;
  (DecoratorFactory as any).annotationCls = DecoratorFactory;
  return DecoratorFactory as any;
}

export function makeParamDecorator(
  name: string,
  props?: (...args: any[]) => any,
  additionalParamProcessing?: AdditionalParamProcessing,
): any {
  const metaCtor = makeMetadataCtor(props);
  function ParamDecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof ParamDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }
    const annotationInstance = new (<any>ParamDecoratorFactory)(...args);
    return createParamDecorator(annotationInstance, additionalParamProcessing);
  }

  ParamDecoratorFactory.prototype.gabMetadataName = name;
  (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
  return ParamDecoratorFactory;
}

export function makePropDecorator(
  name: string,
  props?: (...args: any[]) => any,
  additionalPropProcessing?: AdditionalPropProcessing,
  uniq = false,
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR,
): any {
  const metaCtor = makeMetadataCtor(props);

  function PropDecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof PropDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }

    const decoratorInstance = new (<any>PropDecoratorFactory)(...args);

    return createPropDecorator(
      name,
      uniq,
      uniqError,
      decoratorInstance,
      additionalPropProcessing,
    );
  }

  PropDecoratorFactory.prototype.gabMetadataName = name;
  (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
  return PropDecoratorFactory;
}

/**
 * Create a decorator for class and Prop
 */
export function makePropAndAnnotationAndParamDecorator<T>(
  name: string,
  props?: (...args: any[]) => any,
  additionalProcessingAnnotation?: AdditionalProcessingAnnotation<T>,
  additionalPropProcessing?: AdditionalPropProcessing,
  additionalParamProcessing?: AdditionalParamProcessing,
  uniq = false,
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR,
) {
  const metaCtor = makeMetadataCtor(props);
  function DecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof DecoratorFactory) {
      metaCtor.call(this, ...args);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this;
    }

    const annotationInstance = new (DecoratorFactory as any)(...args);
    return function decorator(
      target: any,
      propertyKey?: string,
      descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
    ) {
      if (propertyKey && descriptorOrIndex !== undefined) {
        if (typeof descriptorOrIndex === 'number') {
          return createParamDecorator(
            annotationInstance,
            additionalParamProcessing,
          )(target, propertyKey, descriptorOrIndex);
        }
        return createPropDecorator(
          name,
          uniq,
          uniqError,
          annotationInstance,
          additionalPropProcessing,
        )(target, propertyKey, descriptorOrIndex);
      }
      return createTypeDecorator(
        name,
        uniq,
        uniqError,
        annotationInstance,
        additionalProcessingAnnotation,
      )(target);
    };
  }

  DecoratorFactory.prototype.gabMetadataName = name;
  (DecoratorFactory as any).annotationCls = DecoratorFactory;
  return DecoratorFactory as any;
}
