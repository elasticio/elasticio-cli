/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const utils = require('./utils.js');
const { print } = require('./theme.js');

exports.setupFixture = async function setupFixture(fixtureKey, path) {
  const componentPath = utils.getComponentPath(path);
  const fixtures = utils.readFixtureFile(componentPath);

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
    utils.destroyProcess();
    throw new Error('Fixture does not exist');
  }
  return result;
};

exports.setupFunction = async function setupFunction(functionName, path) {
  const component = utils.resolveComponent(path);

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
    utils.destroyProcess();
    throw new Error('Function does not exist');
  }
  return result;
};

exports.getAction = async function getAction() {
  const componentJSON = utils.readComponentJSON();
};