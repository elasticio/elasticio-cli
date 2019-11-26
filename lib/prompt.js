const inquirer = require('inquirer');
const fixture = require('./fixture.js');
const helpers = require('./helpers.js');
const { print, ERROR } = require('./theme.js');

async function retrieveFixture(fixtureKey, path) {
  const componentPath = helpers.getComponentPath(path);
  const fixtures = fixture.readFixture(componentPath);

  if (!fixtures) {
    print('No fixtures found', ERROR);
    return;
  }

  if (!fixtureKey) {
    const promptMsg = 'Please select your fixture';

    await inquirer.prompt({
      type: 'list',
      name: 'fixture',
      message: promptMsg,
      choices: Object.keys(fixtures),
    }).then((answer) => {
      fixtureKey = answer.fixture;
    });
  }
  const result = fixtures[fixtureKey];
  if (!result) {
    print(`Fixture '${fixtureKey}' does not exist`, ERROR);
    helpers.destroyProcess();
  }
  return result;
}

async function retrieveFunctionName(functionName, path) {
  const component = helpers.resolveComponent(path);

  if (!functionName) {
    const promptMsg = 'Please select your function to execute: ';

    await inquirer.prompt({
      type: 'list',
      name: 'function',
      message: promptMsg,
      choices: Object.keys(component),
    }).then((answer) => {
      functionName = answer.function;
    });
  }

  const result = component[functionName];

  if (!result) {
    print(`Function '${functionName}' does not exist`, ERROR);
    helpers.destroyProcess();
    return;
  }
  return result;
}

exports.retrieveFixture = retrieveFixture;
exports.retrieveFunctionName = retrieveFunctionName;
