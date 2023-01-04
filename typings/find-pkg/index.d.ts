declare module 'find-pkg' {
  export default function findPkg(startPath: string): string | null;

  export function sync(startPath: string): string | null;
}
