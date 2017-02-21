import includeAll = require('include-all');
import * as glob from 'glob';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as d from 'debug';

const debug = d('Gabliam:loader');

export function loadModules(folders: string[]) {
    folders.forEach(folder => {
        debug(`load ${folder}`);
        includeAll({
            dirname: folder,
            filter: /^(?!.*d\.ts$).*\.(ts|js)$/,
            excludeDirs: /^\.(git|svn|node_modules|dist|build)$/
        });
    });
    debug(`end loadModules`);
}

export function loadConfig(folder: string): any {
    debug('loadConfig', folder);
    let files = glob.sync('**/application?(-+([a-zA-Z])).yml', { cwd: folder });
    let config = {};
    if (!files) {
        return config;
    }

    let profile = process.env.PROFILE || null;
    let defaultProfileFile = files.find(file => file === 'application.yml');

    if (defaultProfileFile) {
        config = loadYmlFile(`${folder}/${defaultProfileFile}`);
    }

    if (profile) {
        let profileFile = files.find(file => file === `application-${profile}.yml`);

        if (profileFile) {
            config = _.merge({}, config, loadYmlFile(`${folder}/${profileFile}`));
        }
    }

    return config;
}

function loadYmlFile(ymlPath: string) {
    const data = fs.readFileSync(ymlPath, 'utf8');
    try {
        return yaml.load(data);
    } catch (e) {
        return {};
    }
}
