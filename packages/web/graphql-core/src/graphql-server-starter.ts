import {
  Container,
  Registry,
  Config,
  OnMissingBean,
  Bean,
} from '@gabliam/core';
import {
  APP,
  SERVER,
  ServerStarter,
  WebPluginConfig,
  WEB_PLUGIN_CONFIG,
  SERVER_STARTER,
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
    const app = container.get<any>(APP);
    const port = restConfig.port;

    const server = createServer(<any>app);
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
      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`Listening on ${bind}`);
    }
  }
}
