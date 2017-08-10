import * as glob from 'glob';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as d from 'debug';

const debug = d('Gabliam:loader-config');

export class LoaderConfig {
  /**
   * Load configuration
   * @param  {string} folder the configuration folder
   * @returns any
   */
  load(folder: string, profile = process.env.PROFILE || null): any {
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
    return config;
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
