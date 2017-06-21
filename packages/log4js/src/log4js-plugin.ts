import { interfaces as coreInterfaces, Scan } from '@gabliam/core';

@Scan(__dirname)
export class Log4jsPlugin implements coreInterfaces.GabliamPlugin {}
