/* eslint-disable no-console */
const util = require('util');
const fixture = require('./fixture.js');
const helpers = require('./helpers.js');
const { print } = require('./theme.js');

function toKeyList(obj) {
  const result = `${Object.keys(obj).reduce((acc, next) => acc + util.format('- %s%s', next, '\n'), '\n\n')}\n`;
  return result;
}

function retrieveFixture(program, path, cb) {
  const componentPath = helpers.getComponentPath(path);
  const fixtures = fixture.readFixture(componentPath);

  if (!fixtures) {
    print.error('No fixtures found');
    throw new Error('No fixtures found');
  }

  if (!fixtureKey) {
    const promptMsg = `Following fixture were found: ${toKeyList(fixtures)}Please choose one: `;

    program.prompt(promptMsg, (aFixture) => {
      findFixtureByKey(aFixture.trim());
    });
  }
  const result = fixtures[fixtureKey];
  if (!result) {
    print.error(`Fixture '${fixtureKey}' does not exist`);
    helpers.destroyProcess();
    throw new Error('Fixture does not exist');
  }
  return result;
}

async function retrieveFunctionName(functionName, path) {
  const component = helpers.resolveComponent(path);

  if (!functionName) {
    const promptMsg = `Following functions to execute were found: ${toKeyList(component)}Please choose one: `;

    program.prompt(promptMsg, (aFunction) => {
      findFunctionByName(aFunction.trim());
    });
  }

  const result = component[functionName];

  if (!result) {
    print.error(`Function '${functionName}' does not exist`);
    helpers.destroyProcess();
    throw new Error('Function does not exist');
  }
  return result;
}

exports.retrieveFixture = retrieveFixture;
exports.retrieveFunctionName = retrieveFunctionName;
