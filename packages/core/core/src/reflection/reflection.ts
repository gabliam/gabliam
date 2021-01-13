import { isType, Type } from '../common';
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
        // } else if (paramTypes[i] !== Object) {
        // result[i] = [paramTypes[i]];
      } else {
        result[i] = [paramTypes[i]];
        // result[i] = [];
      }
      if (paramAnnotations && paramAnnotations[i] != null) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }

  private _ownParameters(type: Type<any>, propertyKey: string): any[][] | null {
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

    if (paramTypes && paramAnnotations) {
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }

    return [];
  }

  /**
   * return an array by param.
   * For one param, the array contains the type of param on first and all decorators
   *
   * example :
   * class TestController {
   *    getTest(@Validate() header: Header) {
   *    }
   * }
   *
   * parameters return :
   * [
   *  [Header, ParamDecorator]
   * ]
   */
  parameters(type: Type<any>, property: string): any[][] {
    // Note: only report metadata if we have at least one class decorator
    // to stay in sync with the static reflector.
    if (!isType(type)) {
      return [];
    }

    const parentCtor = getParentCtor(type);
    let parameters = this._ownParameters(type, property);
    if (
      (!Array.isArray(parameters) || parameters.length === 0) &&
      parentCtor !== Object
    ) {
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

  propMetadataOfDecorator<T = {}>(
    typeOrFunc: any,
    ...decoratorOrMetadataNames: any[]
  ): { [key: string]: T[] } {
    if (!isType(typeOrFunc)) {
      return {};
    }

    const gabMetadataNames: string[] = decoratorOrMetadataNames.map(
      decoratorOrMetadataName => {
        return isType(decoratorOrMetadataName)
          ? (decoratorOrMetadataName as any).prototype.gabMetadataName
          : decoratorOrMetadataName;
      }
    );

    const propMetadatas = this.propMetadata(typeOrFunc);
    const props: { [key: string]: any[] } = {};

    for (const [propName, propMetada] of Object.entries(propMetadatas)) {
      const metadatas = [];
      for (const meta of propMetada) {
        if (gabMetadataNames.indexOf(meta.gabMetadataName) !== -1) {
          metadatas.push(meta);
        }
      }
      if (metadatas.length) {
        props[propName] = metadatas;
      }
    }

    return props;
  }

  annotationsOfDecorator<T = {}>(
    typeOrFunc: any,
    decoratorOrMetadataName: any,
    includeParent = true
  ): T[] {
    if (!isType(typeOrFunc)) {
      return [];
    }

    const gabMetadataName: string = getGabMetadataName(decoratorOrMetadataName);

    const annotations = this.annotations(typeOrFunc, includeParent);

    return annotations.filter(a => a.gabMetadataName === gabMetadataName);
  }

  parametersOfDecorator(
    type: Type<any>,
    property: string,
    decoratorOrMetadataName: any
  ): any[][] {
    if (!isType(type)) {
      return [];
    }

    const gabMetadataName: string = getGabMetadataName(decoratorOrMetadataName);

    const parameters = this.parameters(type, property);

    const res = parameters.map(([type, ...metas]) => [
      type,
      metas.filter(a => a.gabMetadataName === gabMetadataName),
    ]);

    return res;
  }
}

const getGabMetadataName = (decoratorOrMetadataName: any): string =>
  isType(decoratorOrMetadataName)
    ? (decoratorOrMetadataName as any).prototype.gabMetadataName
    : decoratorOrMetadataName;

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
