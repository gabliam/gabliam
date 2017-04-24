import { interfaces, Scan, inversifyInterfaces, Registry } from '@gabliam/core';
import { Connection } from './typeorm';

export * from './typeorm';
export * from './constant';


@Scan(__dirname)
export default class PluginsTypeOrm implements interfaces.GabliamPlugin {
    async destroy(container: inversifyInterfaces.Container, registry: Registry) {
        let connection = container.get<Connection>(Connection);
        await connection.close();
    }
}
