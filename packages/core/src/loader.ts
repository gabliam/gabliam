import includeAll = require('include-all');

export function loader(folder: string) {
   includeAll({
        dirname: folder,
        filter: /.*\.(js|ts)$/,
        excludeDirs: /^\.(git|svn|node_modules|dist|build)$/,
        identity: true
    });
}