import 'reflect-metadata';
import * as path from 'path';
import { Gabliam } from '@gabliam/core';
import expressPlugin from '@gabliam/express';
import dbPlugin from '@gabliam/typeorm';

new Gabliam({
  scanPath: __dirname,
  config: path.resolve(__dirname, '../config')
})
  .addPlugin(expressPlugin)
  .addPlugin(dbPlugin)
  .buildAndStart();
