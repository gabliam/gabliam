import _ from 'lodash';
import { Gabliam } from '../gabliam';
import { Register } from '../metadatas';
import { reflection } from '../reflection';
import { LoaderConfigTest } from './loader';
import { GabliamBuilder, isGabliamBuilder } from '../gabliam-utils';

export class GabliamTest {
  public gab: Gabliam;

  public loaderConfig: LoaderConfigTest;

  constructor(gab?: Gabliam | GabliamBuilder) {
    if (gab) {
      this.gab = isGabliamBuilder(gab) ? gab() : gab;
    } else {
      this.gab = new Gabliam();
    }

    this.loaderConfig = this.gab.loaderConfig = new LoaderConfigTest();
  }

  async build() {
    await this.gab.build();
  }

  async startPlugins(...pluginNames: string[]) {
    for (const pluginName of pluginNames) {
      const plugin = this.gab.pluginList.plugins.find(
        p => p.constructor.name === pluginName && _.isFunction(p.start)
      );
      if (plugin) {
        await plugin.start!(this.gab.container, this.gab.registry);
      }
    }
  }

  async destroy() {
    await this.gab.destroy();
  }

  addConf(p: string, conf: any) {
    this.loaderConfig.addConfig(p, conf);
  }

  addClass(ctrl: any) {
    const metadatas = reflection.annotationsOfDecorator<Register>(
      ctrl,
      Register
    );
    if (metadatas.length) {
      const [metadata] = metadatas.slice(-1);
      this.gab.registry.add(metadata.type, {
        id: ctrl,
        target: ctrl,
        options: metadata.options,
        autoBind: true,
      });
    }
    return this;
  }
}
