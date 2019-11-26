/* eslint-disable no-console */
const util = require('util');
const fixture = require('./fixture.js');
const helpers = require('./helpers.js');
require('./theme.js');

function toKeyList(obj) {
  const result = `${Object.keys(obj).reduce((acc, next) => acc + util.format('- %s%s', next, '\n'), '\n\n')}\n`;
  return result;
}

function retrieveFixture(program, path, cb) {
  const componentPath = helpers.getComponentPath(path);
  const fixtures = fixture.readFixture(componentPath);

  if (!fixtures) cb();

  const fixtureKey = program.fixture;

  const findFixtureByKey = (key) => {
    const result = fixtures[key];
    if (!result) {
      console.log("Fixture '%s' does not exist".error, key);
      helpers.destroyProcess();
      cb();
    }
    cb(result);
  };

  if (!fixtureKey) {
    const promptMsg = `Following fixture were found: ${toKeyList(fixtures)}Please choose one: `;

    program.prompt(promptMsg, (aFixture) => {
      findFixtureByKey(aFixture.trim());
    });
  } else {
    findFixtureByKey(fixtureKey);
  }
}

function retrieveFunctionName(program, path, cb) {
  const functionName = program.function;

  const component = helpers.resolveComponent(path);

  const findFunctionByName = (name) => {
    const fn = component[name];

    if (!fn) {
      console.log("Function '%s' does not exist".error, name);
      helpers.destroyProcess();
      return;
    }
    cb(fn);
  };

  if (!functionName) {
    const promptMsg = `Following functions to execute were found: ${toKeyList(component)}Please choose one: `;

    program.prompt(promptMsg, (aFunction) => {
      findFunctionByName(aFunction.trim());
    });
  } else {
    findFunctionByName(functionName);
  }
}

exports.retrieveFixture = retrieveFixture;
exports.retrieveFunctionName = retrieveFunctionName;
