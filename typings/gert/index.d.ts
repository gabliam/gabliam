declare module 'gert' {
  interface GraphOptions {
    directed: boolean;
    vertices: { [k: string]: string[] };
  }
  export class Graph {
    constructor(options: GraphOptions);
  }
}

declare module 'gert-topo-sort' {
  import gert = require('gert');

  type Gts = (graph: gert.Graph) => string[];
  const gts: Gts;

  export = gts;
}
