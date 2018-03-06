import * as shortstop from 'shortstop';
import * as handlers from 'shortstop-handlers';

export type Resolver = (config: any) => Promise<Object>;

export const configResolver = (configPath: string): Resolver => {
  const resolver = shortstop.create();
  resolver.use('file', handlers.file(configPath));
  resolver.use('path', handlers.path(configPath));
  resolver.use('base64', handlers.base64());
  resolver.use('env', handlers.env());
  resolver.use('require', handlers.require(configPath));
  resolver.use('exec', handlers.exec(configPath));
  resolver.use('glob', handlers.glob(configPath));

  return (config: any) =>
    new Promise((resolve, reject) => {
      resolver.resolve(config, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
};
