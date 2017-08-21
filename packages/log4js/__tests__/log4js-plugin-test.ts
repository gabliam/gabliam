import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as path from 'path';
import Log4jsPlugin from '../src/index';

export class Log4jsPluginTest extends GabliamTest {
  constructor(p = path.resolve(__dirname, 'gabliam')) {
    const gab = new Gabliam({
      scanPath: p,
      configPath: p
    }).addPlugin(Log4jsPlugin);
    super(gab);
  }
}
