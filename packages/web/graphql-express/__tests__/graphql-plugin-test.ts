import ExpressPlugin from '@gabliam/express';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import GraphqlPlugin from '../src/index';

export class GraphqlPluginTest extends WebPluginTest {
  constructor() {
    super([ExpressPlugin, GraphqlPlugin]);
  }
}
