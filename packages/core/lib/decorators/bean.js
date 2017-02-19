"use strict";
const constants_1 = require("../constants");
function Bean(id) {
    return function (target, key, descriptor) {
        let metadata = { id, target, key };
        let metadataList = [];
        if (!Reflect.hasOwnMetadata(constants_1.METADATA_KEY.Bean, target.constructor)) {
            Reflect.defineMetadata(constants_1.METADATA_KEY.Bean, metadataList, target.constructor);
        }
        else {
            metadataList = Reflect.getOwnMetadata(constants_1.METADATA_KEY.Bean, target.constructor);
        }
        metadataList.push(metadata);
    };
}
exports.Bean = Bean;
