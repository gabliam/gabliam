import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as path from 'path';
import { GraphqlPlugin } from './graphql-plugin';

export class GraphqlPluginTest extends GabliamTest {
  constructor() {
    const gab = new Gabliam().addPlugin(GraphqlPlugin);
    super(gab);
  }
}
