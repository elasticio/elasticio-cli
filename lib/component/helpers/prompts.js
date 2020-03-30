/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const { resolve } = require('path');
const fs = require('fs');
const utils = require('./utils.js');
const { print } = require('./log.js');

exports.setupFixture = async function setupFixture(fixtureKey, path) {
  const componentPath = utils.getComponentPath(path);
  const fixtures = utils.readFixtureFile(componentPath);

  if (!fixtures) {
    print.error('No fixtures found');
    throw new Error();
  }

  if (fixtureKey && fixtures[fixtureKey]) {
    return fixtures[fixtureKey];
  }

  if (fixtureKey && !fixtures[fixtureKey]) {
    print.error(`Fixture '${fixtureKey}' does not exist. Valid options are: ${Object.keys(fixtures).join(', ')}`);
    throw new Error();
  }

  try {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'fixture',
      message: 'Please select your fixture',
      choices: Object.keys(fixtures),
    });
    fixtureKey = answer.fixture;
    return fixtures[fixtureKey];
  } catch (e) {
    if (e.isTtyError) {
      print.error('Fixture is required to proceed.');
      throw new Error();
    }
    throw e;
  }
};

exports.setupFunction = async function setupFunction(functionName, path) {
  const component = utils.resolveComponent(path);
  const exists = fs.existsSync(path);
  if (!exists) {
    throw new Error(`Expected file at ${path} not found`);
  }

  if (functionName === 'verify' || functionName === 'verifyCredentials') {
    return {
      name: 'verify',
      path: component,
    };
  }


  if (functionName && component[functionName]) {
    return {
      name: functionName,
      path: component[functionName],
    };
  }

  if (functionName && !component[functionName]) {
    print.error(`Fixture '${functionName}' does not exist. Valid options are: ${Object.keys(component).join(', ')}`);
    throw new Error();
  }

  try {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'function',
      message: 'Please select your function to execute: ',
      choices: Object.keys(component),
    });
    functionName = answer.function;

    return {
      name: functionName,
      path: component[functionName],
    };
  } catch (e) {
    if (e.isTtyError) {
      print.error('Function is required to proceed.');
      throw new Error();
    }
    throw e;
  }
};

// eslint-disable-next-line no-unused-vars
exports.getActionPath = async function getActionPath(componentPath, actionName, fixture) {
  if (actionName === 'verify' || actionName === 'verifyCredentials') {
    return {
      name: 'verifyCredentials',
      path: resolve(componentPath, './verifyCredentials.js'),
    };
  }
  const component = utils.readComponentJSON(componentPath);
  const files = {};

  if (component.actions) {
    Object.keys(component.actions).forEach((action) => {
      files[action] = component.actions[action].main;
    });
  }

  if (component.triggers) {
    Object.keys(component.triggers).forEach((trigger) => {
      files[trigger] = component.triggers[trigger].main;
    });
  }

  if (actionName && files[actionName]) {
    return {
      name: actionName,
      path: resolve(componentPath, files[actionName]),
    };
  }

  if (actionName && !files[actionName]) {
    print.error(`Action/trigger '${actionName}' does not exist. Valid options are: ${Object.keys(files).join(', ')}`);
    throw new Error();
  }

  try {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Please select your action/trigger',
      choices: Object.keys(files),
    });
    actionName = answer.action;
    return {
      name: actionName,
      path: resolve(componentPath, files[actionName]),
    };
  } catch (e) {
    if (e.isTtyError) {
      print.error('Action/trigger is required to proceed.');
      throw new Error();
    }
    throw e;
  }
};

exports.verifyOrAction = async function verifyOrAction() {
  try {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'select',
      message: 'Would you like to run verifyCredentials or an action/trigger?',
      choices: [{
        name: 'Verify Credentials',
        value: 'verifyCredentials',
      }, {
        name: 'Action/Trigger',
        value: null,
      }],
    });
    return answer.select;
  } catch (e) {
    if (e.isTtyError) {
      print.error('Action/trigger vs verifyCredentials is required to proceed.');
      throw new Error();
    }
    throw e;
  }
};
