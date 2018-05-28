import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import CachePlugin from '../../src/index';

export class CachePluginTest extends GabliamTest {
  constructor() {
    const gab = new Gabliam().addPlugin(CachePlugin);
    super(gab);
  }
}
