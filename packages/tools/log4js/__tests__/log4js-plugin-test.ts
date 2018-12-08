import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import Log4jsPlugin from '../src/index';

export class Log4jsPluginTest extends GabliamTest {
  constructor(p?: string) {
    const gab = new Gabliam({
      config: p,
    }).addPlugin(Log4jsPlugin);
    super(gab);
  }
}
