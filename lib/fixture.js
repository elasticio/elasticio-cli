/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const vars = require('./vars.js');
require('./theme.js');

function findFixtureFile(componentPath) {
  let currentPath = componentPath;

  while (currentPath !== 'C:\\' && currentPath !== '/') {
    const fixtureFile = path.resolve(currentPath, './test/fixture.json');

    if (fs.existsSync(fixtureFile)) {
      return fixtureFile;
    }

    currentPath = path.resolve(currentPath, '..');
  }

  return null;
}

exports.readFixture = function readFixture(componentPath) {
  const fixtureFile = findFixtureFile(componentPath);

  console.log("Reading test fixture from '%s'".info, fixtureFile);

  const fixtureFileExists = fs.existsSync(fixtureFile);

  if (!fixtureFileExists) {
    console.log('No fixture file found. Please define test fixtures in file test/fixture.json'.error);
    return null;
  }

  const content = fs.readFileSync(fixtureFile);
  const template = content.toString();
  const data = vars.resolveVars(template);
  return data.fixtures || {};
};
