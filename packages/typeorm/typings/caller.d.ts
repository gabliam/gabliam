declare module 'caller' {
  interface Caller {
    (depths?: number): string;
  }
  var c: Caller;
  export = c;
}
