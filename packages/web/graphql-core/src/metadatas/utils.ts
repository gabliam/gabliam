import * as path from 'path';

export function absoluteGraphqlFiles(graphqlFiles: string[], pwd: string) {
  return graphqlFiles.map(f => absoluteGraphqlFile(f, pwd));
}

export function absoluteGraphqlFile(graphqlFile: string, pwd: string) {
  if (path.isAbsolute(graphqlFile)) {
    return graphqlFile;
  } else {
    return path.resolve(pwd, graphqlFile);
  }
}
