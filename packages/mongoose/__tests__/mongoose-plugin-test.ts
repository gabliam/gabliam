import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import MongoosePlugin from '../src/index';

export class MongoosePluginTest extends GabliamTest {
  constructor() {
    const gab = new Gabliam().addPlugin(MongoosePlugin);
    super(gab);
  }
}
