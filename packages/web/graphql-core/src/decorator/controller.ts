import {
  injectable,
  inversifyInterfaces as interfaces,
  register,
} from '@gabliam/core';
import * as caller from 'caller';
import * as path from 'path';
import { METADATA_KEY, TYPE } from '../constants';
import { ControllerMetadata } from '../interfaces';
import { absoluteGraphqlFiles } from './utils';

/**
 * GraphqlController decorator
 *
 * Add a GraphqlController
 */
export function GraphqlController(
  {
    schema = [],
    graphqlFiles = [],
    pwd,
  }: {
    schema?: string[];
    graphqlFiles?: string[];
    pwd?: string;
  } = {
    schema: [],
    graphqlFiles: [],
  }
) {
  if (!pwd) {
    pwd = path.dirname(caller());
  }
  if (graphqlFiles) {
    graphqlFiles = absoluteGraphqlFiles(graphqlFiles, pwd);
  }
  return (target: any) => {
    const id: interfaces.ServiceIdentifier<any> = target;
    injectable()(target);
    register(TYPE.Controller, { id, target })(target);
    const metadata: ControllerMetadata = { schema, graphqlFiles };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  };
}
