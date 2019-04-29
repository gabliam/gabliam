import { RequestListener } from 'http';
import { ExecutionContext } from './execution-context';
import { GabContext } from './gab-context';

export type nextFn = () => Promise<any>;

export type convertValueFn = (
  ctx: GabContext<any, any>,
  execCtx: ExecutionContext,
  result: any
) => void;

export type extractArgsFn = <V>(
  ctx: GabContext,
  execCtx: ExecutionContext | null | undefined,
  next: V
) => Promise<any>;

export type requestListenerCreator = () => RequestListener;
