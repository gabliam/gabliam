// tslint:disable:no-shadowed-variable member-ordering
import { Type, isType } from '../type';
import { ANNOTATIONS, PARAMETERS, PROP_METADATA } from '../decorator/util';

export class Reflection {
  constructor(private _reflect: any = Reflect) {}

  /** @internal */
  _zipTypesAndAnnotations(paramTypes: any[], paramAnnotations: any[]): any[][] {
    let result: any[][];

    if (typeof paramTypes === 'undefined') {
      result = new Array(paramAnnotations.length);
    } else {
      result = new Array(paramTypes.length);
    }

    for (let i = 0; i < result.length; i++) {
      if (typeof paramTypes === 'undefined') {
        result[i] = [];
      } else if (paramTypes[i] !== Object) {
        result[i] = [paramTypes[i]];
      } else {
        result[i] = [];
      }
      if (paramAnnotations && paramAnnotations[i] != null) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }

  private _ownParameters(type: Type<any>, propertyKey: string): any[][] | null {
    console.log(
      'after constructor',
      {
        'type.hasOwnProperty(PARAMETERS)': type.hasOwnProperty(PARAMETERS),
        '(type as any)[PARAMETERS]': (type as any)[PARAMETERS],
        paramTypes: this._reflect.getOwnMetadata(
          'design:paramtypes',
          type,
          propertyKey
        ),
        paramTypes2: this._reflect.getOwnMetadata(
          'design:paramtypes',
          type.constructor,
          propertyKey
        ),
        paramTypes3: this._reflect.getMetadata(
          'design:paramtypes',
          type,
          propertyKey
        ),
        paramTypes4: this._reflect.getMetadata(
          'design:paramtypes',
          type.constructor,
          propertyKey
        ),
      },
      {
        paramTypes: this._reflect.getOwnMetadata(
          'design:paramtypes',
          type,
          propertyKey
        ),
        paramTypes2: this._reflect.getOwnMetadata(
          'design:paramtypes',
          type.prototype,
          propertyKey
        ),
        paramTypes3: this._reflect.getMetadata(
          'design:paramtypes',
          type,
          propertyKey
        ),
        paramTypes4: this._reflect.getMetadata(
          'design:paramtypes',
          type.prototype,
          propertyKey
        ),
      }
    );

    // API for metadata created by invoking the decorators.
    const paramAnnotations =
      type.hasOwnProperty(PARAMETERS) &&
      (type as any)[PARAMETERS] &&
      (type as any)[PARAMETERS][propertyKey]
        ? (type as any)[PARAMETERS][propertyKey]
        : undefined;
    const paramTypes = this._reflect.getOwnMetadata(
      'design:paramtypes',
      type.prototype,
      propertyKey
    );

    console.log('final', paramAnnotations, paramTypes);
    if (paramTypes || paramAnnotations) {
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }

    // If a class has no decorators, at least create metadata
    // based on function.length.
    // Note: We know that this is a real constructor as we checked
    // the content of the constructor above.
    return new Array(<any>type.length).fill(undefined);
  }

  parameters(type: Type<any>, property: string): any[][] {
    // Note: only report metadata if we have at least one class decorator
    // to stay in sync with the static reflector.
    if (!isType(type)) {
      return [];
    }

    const parentCtor = getParentCtor(type);
    let parameters = this._ownParameters(type, property);
    if (!parameters && parentCtor !== Object) {
      parameters = this.parameters(parentCtor, property);
    }
    return parameters || [];
  }

  private _ownAnnotations(
    typeOrFunc: Type<any>,
    parentCtor: any
  ): any[] | null {
    // API for metadata created by invoking the decorators.
    if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
      return (typeOrFunc as any)[ANNOTATIONS];
    }
    return null;
  }

  /**
   * Extract annotations
   * order: parent => own
   */
  annotations(typeOrFunc: Type<any>, includeParent = true): any[] {
    if (!isType(typeOrFunc)) {
      return [];
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];

    if (includeParent) {
      const parentAnnotations =
        parentCtor !== Object ? this.annotations(parentCtor) : [];
      return parentAnnotations.concat(ownAnnotations);
    }

    return ownAnnotations;
  }

  private _ownPropMetadata(typeOrFunc: any): { [key: string]: any[] } | null {
    // API for metadata created by invoking the decorators.
    if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
      return (typeOrFunc as any)[PROP_METADATA];
    }
    return null;
  }

  /**
   * Extract props metadata
   * order: parent => own
   */
  propMetadata(typeOrFunc: any): { [key: string]: any[] } {
    if (!isType(typeOrFunc)) {
      return {};
    }

    const parentCtor = getParentCtor(typeOrFunc);
    const propMetadata: { [key: string]: any[] } = {};
    if (parentCtor !== Object) {
      const parentPropMetadata = this.propMetadata(parentCtor);
      Object.keys(parentPropMetadata).forEach(propName => {
        propMetadata[propName] = parentPropMetadata[propName];
      });
    }
    const ownPropMetadata = this._ownPropMetadata(typeOrFunc);
    if (ownPropMetadata) {
      Object.keys(ownPropMetadata).forEach(propName => {
        const decorators: any[] = [];
        if (propMetadata.hasOwnProperty(propName)) {
          decorators.push(...propMetadata[propName]);
        }
        decorators.push(...ownPropMetadata[propName]);
        propMetadata[propName] = decorators;
      });
    }
    return propMetadata;
  }

  propsOfMetadata<T = {}>(
    typeOrFunc: any,
    decoratorOrMetadataName: any
  ): { [key: string]: T[] } {
    if (!isType(typeOrFunc)) {
      return {};
    }

    const gabMetadataName: string = isType(decoratorOrMetadataName)
      ? (decoratorOrMetadataName as any).prototype.gabMetadataName
      : decoratorOrMetadataName;

    const propMetadatas = this.propMetadata(typeOrFunc);
    const props: { [key: string]: any[] } = {};

    for (const [propName, propMetada] of Object.entries(propMetadatas)) {
      const metadatas = [];
      for (const meta of propMetada) {
        if (meta.gabMetadataName === gabMetadataName) {
          metadatas.push(meta);
        }
      }
      if (metadatas.length) {
        props[propName] = metadatas;
      }
    }

    return props;
  }

  annotationsOfMetadata<T = {}>(
    typeOrFunc: any,
    decoratorOrMetadataName: any,
    includeParent = true
  ): T[] {
    if (!isType(typeOrFunc)) {
      return [];
    }

    const gabMetadataName: string = isType(decoratorOrMetadataName)
      ? (decoratorOrMetadataName as any).prototype.gabMetadataName
      : decoratorOrMetadataName;

    const annotations = this.annotations(typeOrFunc, includeParent);

    return annotations.filter(a => a.gabMetadataName === gabMetadataName);
  }
}

function getParentCtor(ctor: Function): Type<any> {
  const parentProto = ctor.prototype
    ? Object.getPrototypeOf(ctor.prototype)
    : null;
  const parentCtor = parentProto ? parentProto.constructor : null;
  // Note: We always use `Object` as the null value
  // to simplify checking later on.
  return parentCtor || Object;
}

export const reflection = new Reflection();
