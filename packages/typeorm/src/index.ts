import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { Gabliam } from '@gabliam/core';

export * from 'typeorm';

export const ConnectionOptionsBean = Symbol('ConnectionOptionsBean')

export default async function(framework: Gabliam) {
    let connectionOptions = framework.container.get<ConnectionOptions>(ConnectionOptionsBean);
    let entities: any = connectionOptions.entities || [];
    entities.push(`${framework.discoverPath}/**/*{.js,.ts}`);
    
    const conn = await createConnection({
        ...connectionOptions,
        entities
    });
    
    framework
        .container
        .bind<Connection>(Connection)
        .toConstantValue(conn);
};