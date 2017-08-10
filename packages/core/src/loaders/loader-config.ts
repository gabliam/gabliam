import * as glob from 'glob';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as d from 'debug';
import * as shortstop from 'shortstop';
import * as handlers from 'shortstop-handlers';

const debug = d('Gabliam:loader-config');

export class LoaderConfig {
  /**
   * Load configuration
   * @param  {string} folder the configuration folder
   * @returns any
   */
  async load(
    scanPath: string,
    folder: string,
    profile = process.env.PROFILE || null
  ): Promise<any> {
    const resolver = shortstop.create();
    resolver.use('file', handlers.file(scanPath));
    resolver.use('path', handlers.path(scanPath));
    resolver.use('base64', handlers.base64());
    resolver.use('env', handlers.env());
    resolver.use('require', handlers.require(scanPath));
    resolver.use('exec', handlers.exec(scanPath));
    resolver.use('glob', handlers.glob(scanPath));

    debug('loadConfig', folder);
    const files = glob.sync('**/application?(-+([a-zA-Z])).yml', {
      cwd: folder
    });
    let config = {};

    if (!files || files.length === 0) {
      return config;
    }

    const defaultProfileFile = files.find(file => file === 'application.yml');

    if (defaultProfileFile) {
      config = this.loadYmlFile(`${folder}/${defaultProfileFile}`);
    }

    if (profile) {
      const profileFile = files.find(
        file => file === `application-${profile}.yml`
      );

      if (profileFile) {
        config = _.merge(
          {},
          config,
          this.loadYmlFile(`${folder}/${profileFile}`)
        );
      }
    }

    debug('loadConfig', config);
    return new Promise((resolve, reject) => {
      resolver.resolve(config, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private loadYmlFile(ymlPath: string) {
    const data = fs.readFileSync(ymlPath, 'utf8');
    try {
      return yaml.load(data) || {};
    } catch (e) {
      return {};
    }
  }
}
