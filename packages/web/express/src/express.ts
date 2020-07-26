import express from 'express';
import { GabContext } from '@gabliam/web-core';

export { express };

export interface CustomRequest extends express.Request {
  context: GabContext;
}
