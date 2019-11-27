const inquirer = require('inquirer');
const fixture = require('./fixture.js');
const helpers = require('./helpers.js');
const { print } = require('./theme.js');

async function retrieveFixture(fixtureKey, path) {
  const componentPath = helpers.getComponentPath(path);
  const fixtures = fixture.readFixture(componentPath);

  if (!fixtures) {
    print.error('No fixtures found');
    throw new Error('No fixtures found');
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
    print.error(`Fixture '${fixtureKey}' does not exist`);
    helpers.destroyProcess();
    throw new Error('Fixture does not exist');
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
    print.error(`Function '${functionName}' does not exist`);
    helpers.destroyProcess();
    throw new Error('Function does not exist');
  }
  return result;
}

exports.retrieveFixture = retrieveFixture;
exports.retrieveFunctionName = retrieveFunctionName;
