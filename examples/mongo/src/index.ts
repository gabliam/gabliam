import 'reflect-metadata';
import { Gabliam } from '@gabliam/core';
import dbPlugin from '@gabliam/mongoose';
import * as path from 'path';

const bootstrap = async () => {
  const plugins = [dbPlugin];
  if (process.env.SERVER_TYPE === 'koa') {
    console.log('start with koa');
    plugins.push(require('@gabliam/koa').default);
  } else {
    console.log('start with express');
    plugins.push(require('@gabliam/express').default);
  }

  return new Gabliam({
    scanPath: __dirname,
    config: path.resolve(__dirname, '../config'),
  })
    .addPlugins(...plugins)
    .buildAndStart();
};

bootstrap();
