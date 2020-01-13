import 'reflect-metadata';
import * as path from 'path';
import { Gabliam } from '@gabliam/core';
import expressPlugin from '@gabliam/express';

new Gabliam({
  scanPath: __dirname,
  config: path.resolve(__dirname, '../config'),
})
  .addPlugins(expressPlugin)
  .buildAndStart();
