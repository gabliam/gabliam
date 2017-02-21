import { interfaces } from '@gabliam/core';

export * from './typeorm';
export * from './constant';

const plugin: interfaces.PluginDescriptor = {
    discoverPath: __dirname
};

export { plugin as default }; 
