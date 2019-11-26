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
  } else {
    findFunctionByName(functionName);
  }
}

exports.retrieveFixture = retrieveFixture;
exports.retrieveFunctionName = retrieveFunctionName;
