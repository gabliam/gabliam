/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import * as path from 'path';
import { Gabliam } from '@gabliam/core';
// import expressPlugin from '@gabliam/express';
import dbPlugin from '@gabliam/typeorm';
// import graphqlPlugin from '@gabliam/graphql-express';

const bootstrap = async () => {
  const plugins = [dbPlugin];
  if (process.env.SERVER_TYPE === 'koa') {
    console.log('start with koa');
    plugins.push(
      require('@gabliam/koa').default,
      require('@gabliam/graphql-koa').default
    );
  } else {
    console.log('start with express');
    plugins.push(
      require('@gabliam/express').default,
      require('@gabliam/graphql-express').default
    );
  }

  return new Gabliam({
    scanPath: __dirname,
    config: path.resolve(__dirname, '../config'),
  })
    .addPlugins(...plugins)
    .buildAndStart();
};

bootstrap().then((app) => {
  console.log('GO to http://localhost:3000/graphql');
});

process.on('unhandledRejection', (err: any, p: any) => {
  console.error('An unhandledRejection occurred');
  console.error(`Rejected Promise: ${p}`);
  console.error(`Rejection: ${err}`);
  console.error(`Rejection: ${err.stack}`);
});
