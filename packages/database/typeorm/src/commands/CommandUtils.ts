import { gabliamBuilder, gabliamFindApp, setupTsProject } from '@gabliam/core';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { GabliamConnectionOptionsReader } from '../connection-options-reader';

/**
 * Command line utils functions.
 */
export class CommandUtils {
  /**
   * Creates directories recursively.
   */
  static createDirectories(directory: string) {
    return new Promise<void>((ok, fail) =>
      (mkdirp as any)(directory, (err: any) => (err ? fail(err) : ok())),
    );
  }

  /**
   * Creates a file with the given content in the given path.
   */
  static async createFile(
    filePath: string,
    content: string,
    override = true,
  ): Promise<void> {
    await CommandUtils.createDirectories(path.dirname(filePath));
    return new Promise<void>((ok, fail) => {
      if (override === false && fs.existsSync(filePath)) {
        ok();
      } else {
        fs.writeFile(filePath, content, (err) => (err ? fail(err) : ok()));
      }
    });
  }

  /**
   * Reads everything from a given file and returns its content as a string.
   */
  static async readFile(filePath: string): Promise<string> {
    return new Promise<string>((ok, fail) => {
      fs.readFile(filePath, (err, data) =>
        err ? fail(err) : ok(data.toString()),
      );
    });
  }

  static async fileExists(filePath: string) {
    return fs.existsSync(filePath);
  }

  static async getGabliamConnectionOptionsReader(
    options?: {
      /**
       * Directory where ormconfig should be read from.
       * By default its your application root (where your app package.json is located).
       */
      root?: string | undefined;
      /**
       * Filename of the ormconfig configuration. By default its equal to "ormconfig".
       */
      configName?: string | undefined;
    },
    appName?: string,
  ) {
    await setupTsProject(process.cwd());
    const application = await gabliamFindApp(process.cwd(), appName);
    const gabliam = await gabliamBuilder(application)().build();
    const connectionOptions = gabliam.container.get(
      GabliamConnectionOptionsReader,
    );
    return connectionOptions.buildNew(options);
  }
}
