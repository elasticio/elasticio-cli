const inquirer = require('inquirer');
const fixture = require('./fixture.js');
const helpers = require('./helpers.js');
const { print, ERROR } = require('./theme.js');


function retrieveFixture(program, path, cb) {
  const componentPath = helpers.getComponentPath(path);
  const fixtures = fixture.readFixture(componentPath);

  if (!fixtures) cb();

  const fixtureKey = program.fixture;

  const findFixtureByKey = (key) => {
    const result = fixtures[key];
    if (!result) {
      print(`Fixture '${key}' does not exist`, ERROR);
      helpers.destroyProcess();
      cb();
    }
    cb(result);
  };

  if (!fixtureKey) {
    const promptMsg = 'Please select your fixture';

    inquirer.prompt({
      type: 'list',
      name: 'fixture',
      message: promptMsg,
      choices: Object.keys(fixtures),
    }).then((answer) => {
      findFixtureByKey(answer.fixture);
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

  const findFunctionByName = (name) => {
    const fn = component[name];

    if (!fn) {
      print(`Function '${name}' does not exist`, ERROR);
      helpers.destroyProcess();
      return;
    }
    cb(fn);
  };

  if (!functionName) {
    const promptMsg = 'Please select your function to execute: ';

    inquirer.prompt({
      type: 'list',
      name: 'fixture',
      message: promptMsg,
      choices: Object.keys(component),
    }).then((answer) => {
      findFunctionByName(answer.fixture);
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
