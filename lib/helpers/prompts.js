/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const { resolve } = require('path');
const utils = require('./utils.js');
const { print } = require('./theme.js');

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
    print.warn(`Fixture '${fixtureKey}' does not exist`);
  }

  await inquirer.prompt({
    type: 'list',
    name: 'fixture',
    message: 'Please select your fixture',
    choices: Object.keys(fixtures),
  }).then((answer) => {
    fixtureKey = answer.fixture;
  });
  return fixtures[fixtureKey];
};

exports.setupFunction = async function setupFunction(functionName, path) {
  const component = utils.resolveComponent(path);

  if (functionName && component[functionName]) {
    return component[functionName];
  }

  if (functionName && !component[functionName]) {
    print.warn(`Function '${functionName}' does not exist`);
  }

  await inquirer.prompt({
    type: 'list',
    name: 'function',
    message: 'Please select your function to execute: ',
    choices: Object.keys(component),
  }).then((answer) => {
    functionName = answer.function;
  });

  return component[functionName];
};

exports.getActionPath = async function getActionPath(componentPath, actionName) {
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
    return resolve(componentPath, files[actionName]);
  }

  if (actionName && !files[actionName]) {
    print.warn(`Action/trigger '${actionName}' does not exist`);
  }

  await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Please select your fixture',
    choices: Object.keys(files),
  }).then((answer) => {
    actionName = answer.action;
  });
  return resolve(componentPath, files[actionName]);
};
