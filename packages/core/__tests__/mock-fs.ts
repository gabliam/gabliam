import * as path from 'path';
import * as fs from 'fs-extra';
import { tmpdir } from 'os';

export interface MockFsConfig {
  [k: string]: MockFsFileConfig;
}

export interface MockFsFileConfig {
  [k: string]: string;
}

export class MockFs {
  private dir: string;

  constructor(config: MockFsConfig) {
    const dir = (this.dir = path.resolve(tmpdir(), 'mock-fs-test'));
    fs.mkdirpSync(dir);
    for (const [folderName, fileConfig] of Object.entries(config)) {
      const folderPath = path.resolve(dir, folderName);
      fs.mkdirpSync(folderPath);
      for (const [fileName, fileContent] of Object.entries(fileConfig)) {
        const filePath = path.resolve(folderPath, fileName);
        fs.mkdirpSync(path.dirname(filePath));
        fs.writeFileSync(filePath, fileContent);
      }
    }
  }

  resolve(...p: string[]) {
    return path.resolve(this.dir, ...p);
  }

  restore() {
    fs.removeSync(this.dir);
  }
}
