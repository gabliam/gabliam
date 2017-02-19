"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const typeorm_1 = require("typeorm");
__export(require("typeorm"));
function default_1(framework) {
    return __awaiter(this, void 0, void 0, function* () {
        let driver = framework.container.get('DriverOptions');
        const conn = yield typeorm_1.createConnection({
            driver,
            entities: [
                `${framework.discoverPath}/**/*{.js,.ts}`
            ],
            autoSchemaSync: true,
        });
        framework
            .container
            .bind(typeorm_1.Connection)
            .toConstantValue(conn);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
