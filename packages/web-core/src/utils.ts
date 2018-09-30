import { DEFAULT_PARAM_VALUE, PARAMETER_TYPE } from './constants';
import { ParameterMetadata } from './decorators';
import { ExecutionContext } from './execution-context';
import { GabContext } from './gab-context';

export const cleanPath = (path: string) => {
  return path.replace(/\/+/gi, '/');
};

export const extractParameters = <T extends Object, U extends keyof T, V>(
  target: T,
  key: U,
  execCtx: ExecutionContext | null | undefined,
  ctx: GabContext,
  next: V,
  params: ParameterMetadata[]
): any[] => {
  const args = [];
  if (!params || !params.length) {
    return [ctx.request, ctx.response, next];
  }

  // create de param getter
  const getParam = getFuncParam(target, key);
  for (const item of params) {
    switch (item.type) {
      case PARAMETER_TYPE.CONTEXT:
      default:
        args[item.index] = ctx;
        break; // response
      case PARAMETER_TYPE.RESPONSE:
        args[item.index] = getParam(ctx.response, null, item);
        break;
      case PARAMETER_TYPE.REQUEST:
        args[item.index] = getParam(ctx.request, null, item);
        break;
      case PARAMETER_TYPE.NEXT:
        args[item.index] = next;
        break;
      case PARAMETER_TYPE.PARAMS:
        args[item.index] = getParam(ctx.request, 'params', item);
        break;
      case PARAMETER_TYPE.QUERY:
        args[item.index] = getParam(ctx.request, 'query', item);
        break;
      case PARAMETER_TYPE.BODY:
        args[item.index] = getParam(ctx.request, 'body', item);
        break;
      case PARAMETER_TYPE.HEADERS:
        args[item.index] = getParam(ctx.request, 'headers', item);
        break;
      case PARAMETER_TYPE.COOKIES:
        args[item.index] = getParam(ctx, 'cookies', item, true);
        break;
      case PARAMETER_TYPE.EXEC_CONTEXT:
        args[item.index] = execCtx;
        break;
    }
  }

  return args;
};

const getFuncParam = <T extends Object, U extends keyof T>(
  target: T,
  key: U
) => {
  return (
    source: any,
    paramType: string | null,
    itemParam: ParameterMetadata,
    getter = false
  ) => {
    const name = itemParam.parameterName;

    // get the param source
    let param = source;
    if (paramType !== null && source[paramType]) {
      param = source[paramType];
    }

    let res = getter ? param.get(name) : param[name];
    if (res !== undefined) {
      /**
       * For query, all value sare considered to string value.
       * If the query waits for a Number, we try to convert the value
       */
      if (paramType === 'query' || paramType === 'params') {
        const type: Function[] = Reflect.getMetadata(
          'design:paramtypes',
          target,
          <any>key
        );
        if (Array.isArray(type) && type[itemParam.index]) {
          try {
            if (type[itemParam.index].name === 'Number') {
              // parseFloat for compatibility with integer and float
              res = Number.parseFloat(res);
            }
          } catch (e) {}
        }
      }
      return res;
    } else {
      return name === DEFAULT_PARAM_VALUE ? param : undefined;
    }
  };
};
