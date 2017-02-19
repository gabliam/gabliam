import { createConnection, Connection, DriverOptions } from "typeorm";
import { Gabliam } from '@gabliam/core';

export * from "typeorm";

export default async function(framework: Gabliam) {
    let driver = framework.container.get<DriverOptions>('DriverOptions');
    const conn = await createConnection({
            driver,
            entities: [
                `${framework.discoverPath}/**/*{.js,.ts}`
            ],
            autoSchemaSync: true,
        });
    
    framework
        .container
        .bind<Connection>(Connection)
        .toConstantValue(conn);
};