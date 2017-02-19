"use strict";
const constants_1 = require("../constants");
const container_1 = require("../container");
const registry_1 = require("../registry");
function Config() {
    return function (target) {
        let id = target;
        container_1.fluentProvider(id)
            .inSingletonScope()
            .done()(target);
        registry_1.registry.add(constants_1.TYPE.Config, id);
    };
}
exports.Config = Config;
