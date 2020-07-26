import 'reflect-metadata';
import { Gabliam } from '@gabliam/core';
import dbPlugin from '@gabliam/mongoose';
import * as path from 'path';
import { WebConfigurationContructor } from '@gabliam/web-core';
import { BoomInterceptor } from './boom-interceptor';

const bootstrap = async () => {
  const plugins = [dbPlugin];

  const config: Partial<WebConfigurationContructor<any>> = {
    globalInterceptors: [
      BoomInterceptor
    ]
  };

  if (process.env.SERVER_TYPE === 'koa') {
    console.log('start with koa');
    plugins.push(new (require('@gabliam/koa').default as any)(config));
  } else {
    console.log('start with express');
    plugins.push(new (require('@gabliam/express').default as any)(config));
  }

  return new Gabliam({
    scanPath: __dirname,
    config: path.resolve(__dirname, '../config'),
  })
    .addPlugins(...plugins)
    .buildAndStart();
};

bootstrap();
