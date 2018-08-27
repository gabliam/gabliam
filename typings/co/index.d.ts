declare module 'co' {
  type IteratorFn = () => Iterator<any>;

  function co<T = any>(val: any): Promise<T> {}

  const l: co;
  export = l;
}
