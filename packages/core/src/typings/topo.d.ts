declare module 'topo' {
  class Topo {
    nodes: any[];

    constructor();

    add(nodes: any | any[], options?: Topo.AddOptions): void;

    merge(others: any | any[]): any;
  }

  namespace Topo {
    interface AddOptions {
      group?: string;

      before?: string | string[];

      after?: string | string[];

      sort?: number;
    }
  }

  export = Topo;
}
