import { LoaderConfig } from '../loaders';
import * as _ from 'lodash';

export class LoaderConfigTest extends LoaderConfig {
  conf = {};

  addConfig(p: string, conf: any) {
    this.conf = _.set(this.conf, p, conf);
  }

  load(folder: string, profile?: string | null): any {
    const config = super.load(folder, profile);
    return _.merge({}, config, this.conf);
  }
}
