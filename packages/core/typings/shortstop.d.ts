declare module 'shortstop' {
  interface Shortstop {
    create(): Resolver;
  }

  type Callback = (err: any, val: any) => void;

  type Handler = (value: string, callback?: Callback) => void;

  interface Resolver {
    use(protocol: string, handler: Handler): void;
    resolve(data: object, callback: Callback): void;
    resolveFile(path: string, callback: Callback): void;
  }

  const s: Shortstop;

  export = s;
}
