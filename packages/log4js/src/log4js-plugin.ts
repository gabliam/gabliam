import {
  interfaces as coreInterfaces,
  Scan,
  inversifyInterfaces,
  Registry
} from '@gabliam/core';
import { log4js } from './log4js';

@Scan(__dirname)
export class Log4jsPlugin implements coreInterfaces.GabliamPlugin {
  async destroy(container: inversifyInterfaces.Container, registry: Registry) {
    return new Promise<void>(resolve => {
      log4js.shutdown(() => resolve());
    });
  }
}
