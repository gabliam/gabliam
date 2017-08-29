/**
 * thx to OJ Kwon <kwon.ohjoong@gmail.com>
 * https://github.com/kwonoj/jest-typescript-coverage
 */

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const loadCoverage = require('remap-istanbul/lib/loadCoverage');
const remap = require('remap-istanbul/lib/remap');
const writeReport = require('remap-istanbul/lib/writeReport');

const coverageFile = './coverage_jest_raw/coverage-final.json';
const updatedCoverageFile = './coverage_jest_raw/coverage-updated.json';

const isWindows = process.platform === 'win32';

const originalCoverage = fs.readFileSync(coverageFile, 'utf8');

//jest does not correctly escape path to file used as key, force replace it
const originalCoverageJson = JSON.parse(isWindows ? originalCoverage.replace(/\\/g, "\\\\") : originalCoverage);
const updateCoverageJson = {};

_.forIn(originalCoverageJson, (value, key) => {
  const updatedKey = key.replace(path.normalize('/src/'), path.normalize('/build/src/')).replace('.ts', '.js');
  updateCoverageJson[updatedKey] = value;
});

fs.writeFileSync(updatedCoverageFile, JSON.stringify(updateCoverageJson));

const collector = remap(loadCoverage(updatedCoverageFile));
writeReport(collector, 'json', {}, './coverage/coverage.json');
writeReport(collector, 'lcovonly', {}, './coverage/coverage.lcov');
writeReport(collector, 'html', {}, './coverage/html');
