import { reflection } from '@gabliam/core';
import { GraphQLResolveInfo } from 'graphql';
import { extractArgsFn } from './interfaces';
import { GqlParamDecorator } from './metadatas';

export const getExtractArgs = (
  controller: any,
  propKey: string
): extractArgsFn => {
  const params = reflection.parameters(<any>controller.constructor, propKey);

  if (params.length === 0) {
    return (source: any, args: any, context: any, info: GraphQLResolveInfo) => [
      source,
      args,
      context,
      info,
    ];
  }

  const parameters = <[string | undefined, GqlParamDecorator][]>params.map(
    meta => {
      let type: string | undefined;
      if (meta.length === 2) {
        type = meta[0].name;
      }
      return [type, meta.slice(-1)[0] as GqlParamDecorator];
    }
  );

  return (source: any, args: any, context: any, info: GraphQLResolveInfo) => {
    return parameters.map(([type, p]) =>
      p.handler(p.args, type, source, args, context, info)
    );
  };
};
