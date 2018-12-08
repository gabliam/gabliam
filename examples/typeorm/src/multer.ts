import * as multer from 'multer';
import * as multer2 from 'koa-multer';

export const expressMulter = multer({ dest: 'uploads/' });

export const koaMulter = multer2({ dest: 'uploads/' });
