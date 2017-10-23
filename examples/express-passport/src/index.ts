import 'reflect-metadata';
import * as path from 'path';
import { Gabliam } from '@gabliam/core';
import expressPlugin from '@gabliam/express';

new Gabliam({
  scanPath: __dirname,
  configPath: path.resolve(__dirname, '../config')
})
  .addPlugin(expressPlugin)
  .buildAndStart();
