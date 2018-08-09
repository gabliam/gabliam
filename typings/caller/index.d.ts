declare module 'caller' {
  type Caller = (depths?: number) => string;
  const c: Caller;
  export = c;
}
