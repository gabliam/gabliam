import { LoaderConfig } from '../loaders';
import * as _ from 'lodash';

export class LoaderConfigTest extends LoaderConfig {
  conf = {};

  addConfig(p: string, conf: any) {
    this.conf = _.set(this.conf, p, conf);
  }

  async load(
    folder: string,
    profile = process.env.PROFILE || undefined
  ): Promise<any> {
    const config = await super.load(folder, profile);
    return _.merge({}, config, this.conf);
  }
}
