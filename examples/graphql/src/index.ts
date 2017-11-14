import 'reflect-metadata';
import * as path from 'path';
import { Gabliam } from '@gabliam/core';
import expressPlugin from '@gabliam/express';
import dbPlugin from '@gabliam/typeorm';
import graphqlPlugin from '@gabliam/graphql';

new Gabliam({
  scanPath: __dirname,
  config: path.resolve(__dirname, '../config')
})
  .addPlugin(graphqlPlugin)
  .addPlugin(expressPlugin)
  .addPlugin(dbPlugin)
  .buildAndStart();

process.on('unhandledRejection', (err: any, p: any) => {
  console.error('An unhandledRejection occurred');
  console.error(`Rejected Promise: ${p}`);
  console.error(`Rejection: ${err}`);
  console.error(`Rejection: ${err.stack}`);
});
