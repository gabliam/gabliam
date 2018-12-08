import { ParameterMetadata } from './decorator/params';
import { DEFAULT_PARAM_VALUE, PARAMETER_TYPE } from './constants';
import { GraphQLResolveInfo } from 'graphql';
import * as _ from 'lodash';

export const extractParameters = (
  source: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo,
  params: ParameterMetadata[]
): any[] => {
  const extractedParams = [];
  if (!params || !params.length) {
    return [source, args, context, info];
  }
  for (const item of params) {
    switch (item.type) {
      case PARAMETER_TYPE.SOURCE:
      default:
        extractedParams[item.index] = getParam(source, item);
        break; // response
      case PARAMETER_TYPE.ARGS:
        extractedParams[item.index] = getParam(args, item);
        break;
      case PARAMETER_TYPE.CONTEXT:
        extractedParams[item.index] = getParam(context, item);
        break;
      case PARAMETER_TYPE.INFO:
        extractedParams[item.index] = getParam(info, item);
        break;
    }
  }

  return extractedParams;
};

const getParam = (source: any, itemParam: ParameterMetadata) => {
  const name = itemParam.parameterName;

  // get the param source

  const res = _.get(source, itemParam.parameterName);

  if (res) {
    return res;
  }
  return name === DEFAULT_PARAM_VALUE ? source : undefined;
};
