import {
  Bean,
  Config,
  Container,
  OnMissingBean,
  Registry,
} from '@gabliam/core';
import {
  requestListenerCreator,
  REQUEST_LISTENER_CREATOR,
  SERVER,
  ServerStarter,
  SERVER_STARTER,
  WebPluginConfig,
  WEB_PLUGIN_CONFIG,
} from '@gabliam/web-core';
import { ApolloServerBase } from 'apollo-server-core';
import { createServer } from 'http';

@Config(90)
export class GraphqlServerStarterConfig {
  @OnMissingBean(SERVER_STARTER)
  @Bean(SERVER_STARTER)
  createGraphqlServerStarter() {
    return new GraphqlServerStarter();
  }
}

export class GraphqlServerStarter implements ServerStarter {
  apolloServer: ApolloServerBase;

  start(container: Container, registry: Registry) {
    const restConfig = container.get<WebPluginConfig>(WEB_PLUGIN_CONFIG);
    const { port, verbose } = restConfig;

    const listenerCrator = container.get<requestListenerCreator>(
      REQUEST_LISTENER_CREATOR
    );

    const server = createServer(listenerCrator());
    server.listen(port, restConfig.hostname);
    server.on('error', onError);
    server.on('listening', onListening);

    this.apolloServer.installSubscriptionHandlers(server);

    container.bind(SERVER).toConstantValue(server);

    /* istanbul ignore next */
    function onError(error: NodeJS.ErrnoException): void {
      // tslint:disable-next-line:curly
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
  }
}
