import { isAbsolute, resolve } from 'path';

export const resolvePath = (p: string, fileDir: string) => {
  if (isAbsolute(p)) {
    return p;
  }
  return resolve(fileDir, p);
};
