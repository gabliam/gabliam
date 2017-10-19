import {
  Scan,
  Registry,
  Plugin,
  GabliamPlugin,
  Container
} from '@gabliam/core';
import { log4js } from './log4js';

@Plugin()
@Scan()
export class Log4jsPlugin implements GabliamPlugin {
  async destroy(container: Container, registry: Registry) {
    return new Promise<void>(resolve => {
      log4js.shutdown(() => resolve());
    });
  }
}
