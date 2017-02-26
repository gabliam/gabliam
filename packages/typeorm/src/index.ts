import { interfaces, Scan } from '@gabliam/core';

export * from './typeorm';
export * from './constant';


@Scan(__dirname)
export default class PluginsTypeOrm implements interfaces.GabliamPlugin {
}