import { express } from './express';
import { GabContext } from '@gabliam/web-core';
import { CONTEXT } from './constants';

export const getContext = (req: express.Request) => {
  return <GabContext>(<any>req)[CONTEXT];
};
