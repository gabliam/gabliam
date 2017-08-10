declare module 'shortstop-handlers' {
  type Callback = (err: any, val: any) => void;

  type Handler = (value: string, callback?: Callback) => void;

  export function path(basedir?: string): Handler;

  export function file(
    basedir?: string,
    options?: { encoding?: null; flag?: string }
  ): Handler;

  export function base64(): Handler;

  export function env(): Handler;

  export function require(basedir?: string): Handler;

  export function exec(basedir?: string): Handler;

  export function glob(options: string | object): Handler;
}
