import { injectable, Register } from '@gabliam/core';
import { ClassType, Resolver } from 'type-graphql';
import {
  AbstractClassOptions,
  ClassTypeResolver,
} from 'type-graphql/dist/decorators/types';
import { TYPE } from './constants';

export function GabResolver(): ClassDecorator;

export function GabResolver(options: AbstractClassOptions): ClassDecorator;
export function GabResolver(
  typeFunc: ClassTypeResolver,
  options?: AbstractClassOptions,
): ClassDecorator;
export function GabResolver(
  objectType: ClassType,
  options?: AbstractClassOptions,
): ClassDecorator;
export function GabResolver(
  objectTypeOrTypeFuncOrMaybeOptions?: Function | AbstractClassOptions,
  maybeOptions?: AbstractClassOptions,
): ClassDecorator {
  const r = Resolver(
    <any>objectTypeOrTypeFuncOrMaybeOptions,
    maybeOptions,
  );
  return (target: any) => {
    r(target);
    injectable()(target);
    Register({ type: TYPE.Controller, id: target })(target);
  };
}
