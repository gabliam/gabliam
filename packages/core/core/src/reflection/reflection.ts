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
    // Prefer the direct API.
    if (
      (<any>typeOrFunc).annotations &&
      (<any>typeOrFunc).annotations !== parentCtor.annotations
    ) {
      let annotations = (<any>typeOrFunc).annotations;
      if (typeof annotations === 'function' && annotations.annotations) {
        annotations = annotations.annotations;
      }
      return annotations;
    }

    // API for metadata created by invoking the decorators.
    if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
      return (typeOrFunc as any)[ANNOTATIONS];
    }
    return null;
  }

  annotations(typeOrFunc: Type<any>): any[] {
    if (!isType(typeOrFunc)) {
      return [];
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
    const parentAnnotations =
      parentCtor !== Object ? this.annotations(parentCtor) : [];
    return parentAnnotations.concat(ownAnnotations);
  }

  private _ownPropMetadata(
    typeOrFunc: any,
    parentCtor: any
  ): { [key: string]: any[] } | null {
    // Prefer the direct API.
    if (
      (<any>typeOrFunc).propMetadata &&
      (<any>typeOrFunc).propMetadata !== parentCtor.propMetadata
    ) {
      let propMetadata = (<any>typeOrFunc).propMetadata;
      if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
        propMetadata = propMetadata.propMetadata;
      }
      return propMetadata;
    }

    // API for metadata created by invoking the decorators.
    if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
      return (typeOrFunc as any)[PROP_METADATA];
    }
    return null;
  }

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
    const ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
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

  getPropsOfMetadata(
    typeOrFunc: any,
    decoratorOrMetadataName: any
  ): { [key: string]: any[] } {
    const gabMetadataName: string = isType(decoratorOrMetadataName)
      ? (decoratorOrMetadataName as any).prototype.gabMetadataName
      : decoratorOrMetadataName;

    if (!isType(typeOrFunc)) {
      return {};
    }
    const metadatas = this.propMetadata(typeOrFunc);
    const props: { [key: string]: any[] } = {};

    for (const [propName, metasOfProp] of Object.entries(metadatas)) {
      const metas = [];
      for (const meta of metasOfProp) {
        if (meta.gabMetadataName === gabMetadataName) {
          metas.push(meta);
        }
      }
      if (metas.length) {
        props[propName] = metas;
      }
    }

    return props;
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
