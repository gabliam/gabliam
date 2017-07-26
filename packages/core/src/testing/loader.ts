import { Loader } from '../loader';
import * as _ from 'lodash';

export class LoaderTest extends Loader {
  conf = {};

  addConfig(p: string, conf: any) {
    this.conf = _.set(this.conf, p, conf);
  }

  loadConfig(folder: string, profile?: string | null): any {
    const config = super.loadConfig(folder, profile);
    return _.merge({}, config, this.conf);
  }
}
