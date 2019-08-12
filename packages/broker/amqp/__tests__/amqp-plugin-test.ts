import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/src/testing';
import AmqpPlugin from '../src/index';

export class AmqpPluginTest extends GabliamTest {
  constructor() {
    const gab = new Gabliam().addPlugin(AmqpPlugin);
    super(gab);
  }
}
