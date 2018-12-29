import { Type } from '../type';
import { ERRORS_MSGS } from '../constants';

export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__parameters__';
export const PROP_METADATA = '__prop__metadata__';

export function makeDecorator<T>(
  name: string,
  props?: (...args: any[]) => any,
  additionalProcessing?: (type: Type<T>, annotationInstance: any) => void,
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
    return function typeDecorator(cls: Type<T>) {
      // Use of Object.defineProperty is important since it creates non-enumerable property which
      // prevents the property is copied during subclassing.
      const annotations: any[] = cls.hasOwnProperty(ANNOTATIONS)
        ? (cls as any)[ANNOTATIONS]
        : Object.defineProperty(cls, ANNOTATIONS, { value: [] })[ANNOTATIONS];

      if (uniq && annotations.find(a => a.gabMetadataName === name)) {
        throw new Error(uniqError);
      }

      annotations.push(annotationInstance);

      if (additionalProcessing) {
        additionalProcessing(cls, annotationInstance);
      }

      return cls;
    };
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

    (<any>ParamDecorator).annotation = annotationInstance;
    return ParamDecorator;

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
  }

  ParamDecoratorFactory.prototype.gabMetadataName = name;
  (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
  return ParamDecoratorFactory;
}

export function makePropDecorator(
  name: string,
  props?: (...args: any[]) => any,
  parentClass?: any,
  additionalProcessing?: (target: any, name: string, ...args: any[]) => void
): any {
  const metaCtor = makeMetadataCtor(props);

  function PropDecoratorFactory(this: any, ...args: any[]): any {
    if (this instanceof PropDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }

    const decoratorInstance = new (<any>PropDecoratorFactory)(...args);

    function PropDecorator(target: any, key: string) {
      const constructor = target.constructor;
      // Use of Object.defineProperty is important since it creates non-enumerable property which
      // prevents the property is copied during subclassing.
      const meta = constructor.hasOwnProperty(PROP_METADATA)
        ? (constructor as any)[PROP_METADATA]
        : Object.defineProperty(constructor, PROP_METADATA, { value: {} })[
            PROP_METADATA
          ];
      meta[key] = (meta.hasOwnProperty(key) && meta[key]) || [];
      meta[key].unshift(decoratorInstance);

      if (additionalProcessing) {
        additionalProcessing(target, key, ...args);
      }
    }

    return PropDecorator;
  }

  PropDecoratorFactory.prototype.gabMetadataName = name;
  (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
  return PropDecoratorFactory;
}
