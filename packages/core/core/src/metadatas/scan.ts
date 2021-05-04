/* eslint-disable @typescript-eslint/no-redeclare */
import caller from 'caller';
import { dirname } from 'path';
import { METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';
import { resolvePath } from './path-utils';

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
    const fileDir = dirname(caller(4));
    if (!p) {
      pathToAdd = fileDir;
    } else {
      pathToAdd = resolvePath(p, fileDir);
    }
    return { path: pathToAdd };
  },
);
