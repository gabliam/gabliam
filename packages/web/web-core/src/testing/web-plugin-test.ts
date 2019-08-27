import { Gabliam, GabliamPluginConstructor } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/src/testing';
import {
  RequestListenerCreator,
  REQUEST_LISTENER_CREATOR,
} from '@gabliam/web-core';
import * as supertest from 'supertest';

const SUPERTEST = Symbol('SUPERTEST');

export class WebPluginTest extends GabliamTest {
  constructor(plugins: GabliamPluginConstructor[] = []) {
    const gab = new Gabliam();
    if (Array.isArray(plugins) && plugins.length) {
      gab.addPlugins(...plugins);
    }
    super(gab);
  }

  async build() {
    this.addConf('application.web.verbose', false);
    await super.build();
    const container = this.gab.container;
    const listener = container.get<RequestListenerCreator>(
      REQUEST_LISTENER_CREATOR
    );
    container.rebind(REQUEST_LISTENER_CREATOR).toConstantValue(() => {
      const s = supertest(listener());
      container.bind(SUPERTEST).toConstantValue(s);
      return s;
    });
  }

  async start() {
    await this.gab.start();
  }

  async buildAndStart() {
    await this.build();
    await this.start();
  }

  supertest() {
    return this.gab.container.get<supertest.SuperTest<supertest.Test>>(
      SUPERTEST
    );
  }
}
