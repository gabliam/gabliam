import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/src/testing';
import TypeormPlugin from '../src/index';

export class TypeormPluginTest extends GabliamTest {
  constructor() {
    const gab = new Gabliam().addPlugin(TypeormPlugin);
    super(gab);
  }
}
