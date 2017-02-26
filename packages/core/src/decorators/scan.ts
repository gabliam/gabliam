import { registry } from '../registry';

export function Scan(path: string) {
    return function (target: any) {
        registry.addPath(path);
    };
}
