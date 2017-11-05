import { Gabliam } from '@gabliam/core';
import { GabliamTest } from '@gabliam/core/lib/testing';
import * as path from 'path';
import { GraphqlPlugin } from './graphql-plugin';



export class GraphqlPluginTest extends GabliamTest {

  constructor(p = path.resolve(__dirname, 'gabliam')) {
    const gab = new Gabliam({
      scanPath: p,
      config: p
    })
      .addPlugin(GraphqlPlugin);
    super(gab);
  }
}
