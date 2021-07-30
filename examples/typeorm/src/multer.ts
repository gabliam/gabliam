/* eslint-disable @typescript-eslint/no-var-requires */
import multer from 'multer';

const multer2 = require('@koa/multer');

export const expressMulter = <any> multer({ dest: 'uploads/' });

export const koaMulter = multer2({ dest: 'uploads/' });
