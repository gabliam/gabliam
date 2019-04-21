import { ERRORS_MSGS } from '../constants';
import { DecoratorUniqError } from '../errors';
import { Type } from '../type';

export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__parameters__';
export const PROP_METADATA = '__prop__metadata__';

export type AdditionalProcessingAnnotation<T> = (
  type: Type<T>,
  annotationInstance: any
) => void;

export type AdditionalProcessing = (
  target: any,
  name: string,
  descriptor: TypedPropertyDescriptor<any>,
  annotationInstance: any
) => void;

function createTypeDecorator<T = any>(
  name: string,
  uniq: boolean,
  uniqError: string,
  annotationInstance: any,
  additionalProcessingAnnotation?: AdditionalProcessingAnnotation<T>
) {
  return function typeDecorator(cls: Type<T>) {
    // Use of Object.defineProperty is important since it creates non-enumerable property which
    // prevents the property is copied during subclassing.
    const annotations: any[] = cls.hasOwnProperty(ANNOTATIONS)
      ? (cls as any)[ANNOTATIONS]
      : Object.defineProperty(cls, ANNOTATIONS, { value: [] })[ANNOTATIONS];

    if (uniq && annotations.find(a => a.gabMetadataName === name)) {
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
  additionalProcessing?: AdditionalProcessing
) {
  return function PropDecorator(
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const constructor = target.constructor;
    // Use of Object.defineProperty is important since it creates non-enumerable property which
    // prevents the property is copied during subclassing.
    const meta: { [k: string]: any[] } = constructor.hasOwnProperty(
      PROP_METADATA
    )
      ? (constructor as any)[PROP_METADATA]
      : Object.defineProperty(constructor, PROP_METADATA, { value: {} })[
          PROP_METADATA
        ];
    meta[key] = (meta.hasOwnProperty(key) && meta[key]) || [];

    if (uniq && meta[key].find(a => a.gabMetadataName === name)) {
      throw new DecoratorUniqError(uniqError);
    }
    meta[key].unshift(decoratorInstance);

    if (additionalProcessing) {
      additionalProcessing(target, key, descriptor, decoratorInstance);
    }
  };
}

function createParamDecorator(annotationInstance: any) {
  function ParamDecorator(target: any, propertyKey: any, index: number): any {
    const cls = target.constructor;
    // Use of Object.defineProperty is important since it creates non-enumerable property which
    // prevents the property is copied during subclassing.
    const parametersMap = cls.hasOwnProperty(PARAMETERS)
      ? (cls as any)[PARAMETERS]
      : Object.defineProperty(cls, PARAMETERS, { value: {} })[PARAMETERS];

    const parameters = (parametersMap[propertyKey] =
      parametersMap[propertyKey] || []);

    // there might be gaps if some in between parameters do not have annotations.
    // we pad with nulls.
    while (parameters.length <= index) {
      parameters.push(null);
    }

    (parameters[index] = parameters[index] || []).push(annotationInstance);
    return cls;
  }
  (<any>ParamDecorator).annotation = annotationInstance;
  return ParamDecorator;
}

/**
 * Create a decorator for class and Prop
 */
export function makePropAndAnnotationDecorator<T>(
  name: string,
  props?: (...args: any[]) => any,
  additionalProcessingAnnotation?: AdditionalProcessingAnnotation<T>,
  additionalProcessing?: AdditionalProcessing,
  uniq = false,
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR
) {
  const metaCtor = makeMetadataCtor(props);
  function DecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof DecoratorFactory) {
      metaCtor.call(this, ...args);
      // @ts-ignore
      return this;
    }

    const annotationInstance = new (DecoratorFactory as any)(...args);

    return function(
      target: any,
      key?: string,
      descriptor?: TypedPropertyDescriptor<any>
    ) {
      if (key && descriptor) {
        return createPropDecorator(
          name,
          uniq,
          uniqError,
          annotationInstance,
          additionalProcessing
        )(target, key, descriptor);
      } else {
        return createTypeDecorator(
          name,
          uniq,
          uniqError,
          annotationInstance,
          additionalProcessingAnnotation
        )(target);
      }
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
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR
): {
  new (...args: any[]): any;
  (...args: any[]): any;
  (...args: any[]): (cls: any) => any;
} {
  const metaCtor = makeMetadataCtor(props);

  function DecoratorFactory(this: any, ...args: any[]): (cls: Type<T>) => any {
    if (this instanceof DecoratorFactory) {
      metaCtor.call(this, ...args);
      // @ts-ignore
      return this;
    }

    const annotationInstance = new (DecoratorFactory as any)(...args);
    return createTypeDecorator(
      name,
      uniq,
      uniqError,
      annotationInstance,
      additionalProcessingAnnotation
    );
  }

  DecoratorFactory.prototype.gabMetadataName = name;
  (DecoratorFactory as any).annotationCls = DecoratorFactory;
  return DecoratorFactory as any;
}

function makeMetadataCtor(props?: (...args: any[]) => any): any {
  return function ctor(...args: any[]) {
    if (props) {
      const values = props(...args);
      // tslint:disable-next-line:forin
      for (const propName in values) {
        // @ts-ignore
        this[propName] = values[propName];
      }
    }
  };
}

export function makeParamDecorator(
  name: string,
  props?: (...args: any[]) => any
): any {
  const metaCtor = makeMetadataCtor(props);
  function ParamDecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof ParamDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }
    const annotationInstance = new (<any>ParamDecoratorFactory)(...args);
    return createParamDecorator(annotationInstance);
  }

  ParamDecoratorFactory.prototype.gabMetadataName = name;
  (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
  return ParamDecoratorFactory;
}

export function makePropDecorator(
  name: string,
  props?: (...args: any[]) => any,
  additionalProcessing?: AdditionalProcessing,
  uniq = false,
  uniqError = ERRORS_MSGS.DUPLICATED_DECORATOR
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
      additionalProcessing
    );
  }

  PropDecoratorFactory.prototype.gabMetadataName = name;
  (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
  return PropDecoratorFactory;
}
