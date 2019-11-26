const fs = require('fs');
const path = require('path');
const vars = require('./vars.js');
const { print, INFO, ERROR } = require('./theme.js');

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

  print(`Reading test fixture from ${fixtureFile}`, INFO);

  const fixtureFileExists = fs.existsSync(fixtureFile);

  if (!fixtureFileExists) {
    print('No fixture file found. Please define test fixtures in file test/fixture.json', ERROR);
    return null;
  }

  const content = fs.readFileSync(fixtureFile);
  const template = content.toString();
  const data = vars.resolveVars(template);
  return data.fixtures || {};
};
