import { gabliamValue } from '@gabliam/core';
import { createServer, Server } from 'http';
import { RequestListenerCreator } from './interface';
import { WebPluginConfig } from './plugin-config';
import { WebConfiguration } from './web-configuration';

export interface ServerStarter {
  start(
    restConfig: WebPluginConfig,
    webConfiguration: WebConfiguration,
    listenerCreator: RequestListenerCreator
  ): gabliamValue<Server>;
}

/**
 * This class is used for start the http server
 * If you want use a Https, or use an other class (ex: unit-http), override this class
 *
 * Graphql override this class
 */
export class HttpServerStarter implements ServerStarter {
  start(
    restConfig: WebPluginConfig,
    webConfiguration: WebConfiguration,
    listenerCreator: RequestListenerCreator
  ) {
    const { port, verbose } = restConfig;

    let server = createServer(listenerCreator());
    server.listen(port, restConfig.hostname);
    server.on('error', onError);
    server.on('listening', onListening);

    for (const serverConfig of webConfiguration.serverConfigs) {
      server = serverConfig(server);
    }

    /* istanbul ignore next */
    function onError(error: NodeJS.ErrnoException): void {
      if (error.syscall !== 'listen') throw error;
      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
      switch (error.code) {
        case 'EACCES':
          if (verbose) {
            console.error(`${bind} requires elevated privileges`);
          }
          process.exit(1);
          break;
        case 'EADDRINUSE':
          if (verbose) {
            console.error(`${bind} is already in use`);
          }
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /* istanbul ignore next */
    function onListening(): void {
      if (verbose) {
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

    return server;
  }
}
