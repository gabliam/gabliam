import {
  Container,
  reflection,
  Type,
  toPromise,
  gabliamValue,
} from '@gabliam/core';
import { BadPipeError } from './errors/bad-pipe-error';
import { WebConfiguration } from './web-configuration';
import { UsePipes, PipeId } from './metadatas';

const composePipe = (...fns: PipeFn[]): PipeFn => {
  return async (val, type) => {
    return fns.reduce(
      (prevFn, nextFn) =>
        toPromise(prevFn).then((v: any) => toPromise(nextFn(v, type))),
      <any>Promise.resolve(val)
    );
  };
};

export type PipeFn = Pipe['transform'];

export interface Pipe<T = any> {
  transform(value: T, type?: Type<any>): gabliamValue<any>;
}

export function isPipe(value: any): value is Pipe {
  return value && typeof value.transform === 'function';
}

export const createPipeResolver = (container: Container) =>
  function pipeResolver(pipe: any): Pipe {
    if (isPipe(pipe)) {
      return pipe;
    }

    try {
      // test if the interceptor is a ServiceIdentifier
      return container.get(pipe);
    } catch {
      if (pipe.name === undefined) {
        return pipe;
      }

      try {
        // test if interceptor is constructable
        // tslint:disable-next-line:no-unused-expression
        const t = new (<any>pipe)();

        if (!isPipe(t)) {
          throw new BadPipeError(t);
        }

        container
          .bind(pipe)
          .to(pipe)
          .inSingletonScope();
        return container.get(pipe);
      } catch (e) {
        if (e instanceof BadPipeError) {
          throw e;
        } else {
          throw new BadPipeError(pipe);
        }
      }
    }
  };

const defaultPipe: PipeFn = value => Promise.resolve(value);

export const extractPipes = (
  container: Container,
  controller: any,
  key: string,
  index: number,
  addGlobal = true
): PipeFn => {
  const pipeIds: PipeId[] = [];
  const target = controller.constructor;

  if (addGlobal) {
    const webConfiguration = container.get(WebConfiguration);
    pipeIds.push(...webConfiguration.globalPipes);
  }

  (reflection.annotationsOfDecorator<UsePipes>(target, UsePipes) || []).forEach(
    pipe => {
      pipeIds.push(...pipe.ids);
    }
  );

  (
    reflection.propMetadataOfDecorator<UsePipes>(target, UsePipes)[key] || []
  ).forEach(pipe => pipeIds.push(...pipe.ids));

  (
    (
      reflection.parametersOfDecorator(target, key, UsePipes)[index] || []
    ).slice(-1) || []
  ).forEach(deco => {
    deco.forEach((d: any) => pipeIds.push(...d.ids));
  });

  if (pipeIds.length === 0) {
    return defaultPipe;
  }

  const pipeResolver = createPipeResolver(container);

  const pipes: PipeFn[] = [];

  for (const pipeId of pipeIds) {
    const pipe = pipeResolver(pipeId);

    if (isPipe(pipe)) {
      pipes.push(pipe.transform.bind(pipe));
    }
  }

  if (pipes.length === 0) {
    return defaultPipe;
  }

  return composePipe(...pipes);
};
