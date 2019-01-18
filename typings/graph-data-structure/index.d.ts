declare module 'graph-data-structure' {
  interface Graph {
    addNode(n: string): Graph;

    removeNode(n: string): Graph;

    addEdge(u: string, v: string, w?: number): Graph;

    removeEdge(u: string, v: string): Graph;

    setEdgeWeight(u: string, v: string, w: number): Graph;

    getEdgeWeight(u: string, v: string, w: number): Graph;

    nodes(): string[];

    topologicalSort(): string[];
  }

  type GraphConstructor = () => Graph;
  const gts: GraphConstructor;

  export = gts;
}
