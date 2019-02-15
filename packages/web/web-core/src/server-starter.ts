import { Registry, Container, gabliamValue } from '@gabliam/core';
import { WebPluginConfig } from './plugin-config';
import { WEB_PLUGIN_CONFIG, APP, SERVER } from './constants';
import { createServer } from 'http';

export interface ServerStarter {
  start(container: Container, registry: Registry): gabliamValue<void>;
}

/**
 * This class is used for start the http server
 * If you want use a Https, or use an other class (ex: unit-http), override this class
 *
 * Graphql override this class
 */
export class HttpServerStarter implements ServerStarter {
  start(container: Container, registry: Registry) {
    const restConfig = container.get<WebPluginConfig>(WEB_PLUGIN_CONFIG);
    const app = container.get<any>(APP);
    const port = restConfig.port;

    const server = createServer(<any>app);
    server.listen(port, restConfig.hostname);
    server.on('error', onError);
    server.on('listening', onListening);
    container.bind(SERVER).toConstantValue(server);

    /* istanbul ignore next */
    function onError(error: NodeJS.ErrnoException): void {
      // tslint:disable-next-line:curly
      if (error.syscall !== 'listen') throw error;
      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /* istanbul ignore next */
    function onListening(): void {
      const addr = server.address();
      let bind = '';
      if (typeof addr === 'string') {
        bind = `pipe ${addr}`;
      } else if (addr && addr.port) {
        bind = `port ${addr.port}`;
      }
      console.log(`Listening on ${bind}`);
    }
  }
}
