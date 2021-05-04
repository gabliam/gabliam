import _ from 'lodash';
import { LoaderConfig, LoaderConfigOptions } from '../loaders';

export class LoaderConfigTest extends LoaderConfig {
  conf = {};

  addConfig(p: string, conf: any) {
    this.conf = _.set(this.conf, p, conf);
  }

  async load(
    configOptions: string | LoaderConfigOptions[] | undefined,
    profile = process.env.PROFILE || undefined,
  ): Promise<any> {
    const config = await super.load(configOptions, profile);
    return _.merge({}, config, this.conf);
  }
}
