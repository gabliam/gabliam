"use strict";
const includeAll = require("include-all");
function loader(folder) {
    includeAll({
        dirname: folder,
        filter: /.*\.(js|ts)$/,
        excludeDirs: /^\.(git|svn|node_modules|dist|build)$/,
        identity: true
    });
}
exports.loader = loader;
