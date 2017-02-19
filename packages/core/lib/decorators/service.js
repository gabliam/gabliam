"use strict";
const constants_1 = require("../constants");
const container_1 = require("../container");
const registry_1 = require("../registry");
function Service(name) {
    return function (target) {
        let id = name ? name : target;
        container_1.fluentProvider(id)
            .inSingletonScope()
            .done()(target);
        registry_1.registry.add(constants_1.TYPE.Service, id);
    };
}
exports.Service = Service;
