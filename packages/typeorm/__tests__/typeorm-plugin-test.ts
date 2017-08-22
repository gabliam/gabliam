import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as path from 'path';
import TypeormPlugin from '../src/index';

export class TypeormPluginTest extends GabliamTest {
  constructor(p = path.resolve(__dirname, 'gabliam')) {
    const gab = new Gabliam({
      scanPath: p,
      configPath: p
    }).addPlugin(TypeormPlugin);
    super(gab);
  }
}
