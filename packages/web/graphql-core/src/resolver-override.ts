import { injectable, Register } from '@gabliam/core';
import * as type from 'type-graphql';
import { TYPE } from './constants';

const oldResolver = type.Resolver as any;

(<any>type).Resolver = function(...args: any[]) {
  const r = oldResolver(...args);
  return (target: any) => {
    r(target);
    injectable()(target);
    Register({ type: TYPE.Controller, id: target })(target);
  };
};
