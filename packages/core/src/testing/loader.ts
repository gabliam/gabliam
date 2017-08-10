import { LoaderConfig } from '../loaders';
import * as _ from 'lodash';

export class LoaderConfigTest extends LoaderConfig {
  conf = {};

  addConfig(p: string, conf: any) {
    this.conf = _.set(this.conf, p, conf);
  }

  async load(
    scanPath: string,
    folder: string,
    profile = process.env.PROFILE || null
  ): Promise<any> {
    const config = await super.load(scanPath, folder, profile);
    return _.merge({}, config, this.conf);
  }
}
