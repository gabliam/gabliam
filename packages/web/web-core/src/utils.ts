import {
  Container,
  reflection,
  Registry,
  toPromise,
  ValueExtractor,
  VALUE_EXTRACTOR,
} from '@gabliam/core';
import { CONTEXT, METADATA_KEY, TYPE, WEB_PLUGIN_CONFIG } from './constants';
import { NextCalledMulipleError } from './errors';
import { ExecutionContext } from './execution-context';
import { GabContext } from './gab-context';
import { getInterceptors, InterceptorInfo } from './interceptor';
import { convertValueFn, extractArgsFn } from './interface';
import {
  ControllerMetadata,
  ControllerMethod,
  ResponseBody,
  WebParamDecorator,
} from './metadatas';
import { MethodInfo, RestMetadata, WebPluginConfig } from './plugin-config';
import { getValidateInterceptor } from './validate';

export const cleanPath = (path: string) => {
  return path.replace(/\/+/gi, '/');
};

export const getExtractArgs = (
  controller: any,
  propKey: string
): extractArgsFn => {
  const params = reflection.parameters(<any>controller.constructor, propKey);

  if (params.length === 0) {
    return (
      ctx: GabContext,
      execCtx: ExecutionContext | null | undefined,
      next: any
    ) => [ctx.request, ctx.response, next];
  }

  const parameters = <[string | undefined, WebParamDecorator][]>params.map(
    meta => {
      let type: string | undefined;
      if (meta.length === 2) {
        type = meta[0].name;
      }
      return [type, meta.slice(-1)[0] as WebParamDecorator];
    }
  );

  return (
    ctx: GabContext,
    execCtx: ExecutionContext | null | undefined,
    next: any
  ) => {
    return parameters.map(([type, p]) =>
      p.handler(p.args, ctx, type, execCtx, next)
    );
  };
};

/**
 * Build all controllers
 *
 * @param  {Container} container
 * @param  {Registry} registry
 */
export const extractControllerMetadata = (
  container: Container,
  registry: Registry
) => {
  const restConfig = container.get<WebPluginConfig>(WEB_PLUGIN_CONFIG);
  const valueExtractor = container.get<ValueExtractor>(VALUE_EXTRACTOR);

  const controllerIds = registry.get(TYPE.Controller);
  const restMetadata: RestMetadata = {
    ...restConfig,
    controllerInfo: new Map(),
  };

  controllerIds.forEach(({ id: controllerId }) => {
    const controller = container.get<object>(controllerId);

    const [controllerMetadata] = reflection
      .annotationsOfDecorator<ControllerMetadata>(
        controller.constructor,
        METADATA_KEY.controller
      )
      .slice(-1);

    const controllerInterceptors = getInterceptors(
      container,
      controller.constructor
    );

    const methodMetadatas = reflection.propMetadataOfDecorator<
      ControllerMethod
    >(controller.constructor, METADATA_KEY.controllerMethod);

    // if the controller has controllerMetadata and methodMetadatas
    if (controllerMetadata && methodMetadatas) {
      const controllerPath = valueExtractor(
        controllerMetadata.path,
        controllerMetadata.path
      );

      const methods: MethodInfo[] = [];

      restMetadata.controllerInfo.set(controllerId, {
        controllerPath,
        methods,
      });

      for (const [methodName, metas] of Object.entries(methodMetadatas)) {
        const [methodMetadata] = metas.slice(-1);
        let methodPath = cleanPath(
          valueExtractor(methodMetadata.path, methodMetadata.path)
        );

        if (methodPath[0] !== '/') {
          methodPath = '/' + methodPath;
        }

        const methodInterceptors = getInterceptors(
          container,
          controller.constructor,
          methodName
        );

        const validatorInterceptors = getValidateInterceptor(container);

        const methodJson =
          reflection.propMetadataOfDecorator<{}>(
            controller.constructor,
            ResponseBody
          )[methodName] !== undefined
            ? true
            : undefined;

        const interceptors = [
          ...validatorInterceptors,
          ...controllerInterceptors,
          ...methodInterceptors,
        ];

        // if method is true or controller is true and method undefined
        const json =
          methodJson || (controllerMetadata.json && methodJson === undefined);

        methods.push({
          controllerId,
          methodName,
          json,
          extractArgs: getExtractArgs(controller, methodName),
          methodPath,
          method: methodMetadata.method,
          interceptors,
        });
      }
    }
  });

  return restMetadata;
};

export const getContext = (req: any) => {
  return <GabContext>(<any>req)[CONTEXT];
};

export const setContext = (req: any, context: GabContext) => {
  (<any>req)[CONTEXT] = context;
};

export function compose(
  interceptors: InterceptorInfo[],
  converterValue: convertValueFn
) {
  return async function(
    ctx: GabContext,
    execCtx: ExecutionContext,
    next: () => Promise<any>
  ) {
    let index = -1;
    async function dispatch(i: number) {
      if (i <= index) {
        throw new NextCalledMulipleError();
      }
      index = i;
      const interceptor = interceptors[i];

      if (i === interceptors.length) {
        const nextRes = converterValue(ctx, execCtx, await next());
        return Promise.resolve(nextRes);
      }

      if (!interceptor) {
        return Promise.resolve();
      }

      const { instance, extractArgs } = interceptor;

      const callNext = dispatch.bind(null, i + 1);
      let wasCalled = false;
      const nextFn = async () => {
        wasCalled = true;
        await callNext();
      };

      const interceptorArgs = extractArgs(ctx, execCtx, nextFn);

      const res = await toPromise(instance.intercept(...interceptorArgs));
      converterValue(ctx, execCtx, res);
      // call next if interceptor not use next
      if (!wasCalled) {
        await callNext();
      }
    }

    return dispatch(0);
  };
}
