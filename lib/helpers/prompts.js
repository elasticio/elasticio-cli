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
    throw new Error(`Fixture '${fixtureKey}' does not exist. Valid options are: ${Object.keys(fixtures).join(', ')}`);
  }

  const answer = await inquirer.prompt({
    type: 'list',
    name: 'fixture',
    message: 'Please select your fixture',
    choices: Object.keys(fixtures),
  });
  fixtureKey = answer.fixture;
  return fixtures[fixtureKey];
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
    throw new Error(`Function '${functionName}' does not exist. Valid options are: ${Object.keys(component).join(', ')}`);
  }

  await inquirer.prompt({
    type: 'list',
    name: 'function',
    message: 'Please select your function to execute: ',
    choices: Object.keys(component),
  }).then((answer) => {
    functionName = answer.function;
  });

  return {
    name: functionName,
    path: component[functionName],
  };
};

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
    throw new Error(`Action/trigger '${actionName}' does not exist. Valid options are: ${Object.keys(files).join(', ')}`);
  }

  await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Please select your action/trigger',
    choices: Object.keys(files),
  }).then((answer) => {
    actionName = answer.action;
  });

  return {
    name: actionName,
    path: resolve(componentPath, files[actionName]),
  };
};

exports.verifyOrAction = async function verifyOrAction() {
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
};
