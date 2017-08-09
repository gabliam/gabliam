import { METADATA_KEY } from '../constants';
import * as caller from 'caller';
import * as path from 'path';

/**
 * Add path to scan.
 *
 * The path is scanned on loading phase
 *
 * @param  {string} path
 */
export function Scan(p?: string) {
  let pathToAdd: string;
  const fileDir = path.dirname(caller());
  if (!p) {
    pathToAdd = fileDir;
  } else {
    if (path.isAbsolute(p)) {
      pathToAdd = p;
    } else {
      pathToAdd = path.resolve(fileDir, p);
    }
  }

  return function(target: any) {
    let paths: string[] = [];
    if (!Reflect.hasOwnMetadata(METADATA_KEY.scan, target)) {
      Reflect.defineMetadata(METADATA_KEY.scan, paths, target);
    } else {
      paths = Reflect.getOwnMetadata(METADATA_KEY.scan, target);
    }
    paths.push(pathToAdd);
  };
}
