import * as caller from 'caller';
import * as path from 'path';
import { METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';

/**
 * Type of the `Scan` decorator / constructor function.
 */
export interface ScanDecorator {
  /**
   * Decorator that add a path for the scanning phase.
   * Without passing a path, the decorator add the dirname of file
   *
   * @usageNotes
   *
   * ```typescript
   * @Scan()
   * class SampleConfig {
   * }
   * ```
   */
  (p?: string): ClassDecorator;
  new (p?: string): any;
}

/**
 * `Scan` decorator and metadata.
 */
export interface Scan {
  path: string;
}

export const Scan: ScanDecorator = makeDecorator(
  METADATA_KEY.scan,
  (p?: string): Scan => {
    let pathToAdd: string;
    const fileDir = path.dirname(caller(4));
    if (!p) {
      pathToAdd = fileDir;
    } else {
      if (path.isAbsolute(p)) {
        pathToAdd = p;
      } else {
        pathToAdd = path.resolve(fileDir, p);
      }
    }
    return { path: pathToAdd };
  }
);
