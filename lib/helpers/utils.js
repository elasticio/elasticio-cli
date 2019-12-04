/* eslint-disable import/no-dynamic-require, global-require */
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const propParser = require('properties-parser');
const { validate } = require('jsonschema');
const { parse } = require('dotenv');
const { print } = require('./log');

exports.getComponentPath = (compPath) => fs.realpathSync(compPath, {});
exports.formatObject = (obj) => JSON.stringify(obj, null, 4);

exports.destroyProcess = function destroyProcess() {
  process.stdin.destroy();
};

exports.resolveComponent = function resolveComponent(compPath) {
  const componentPath = fs.realpathSync(compPath, {});
  return require(componentPath);
};

function resolveSecretVariables(template, componentPath) {
  const apiKeyFile = path.resolve(componentPath, '.env');
  print.info('Looking for secret keys...');
  const apiKeyFileExists = fs.existsSync(apiKeyFile);

  if (apiKeyFileExists) {
    print.info(`Reading secret key file '${apiKeyFile}'`);
    const context = parse(fs.readFileSync(apiKeyFile).toString());
    const parsed = handlebars.compile(template);

    const result = parsed(context);
    return JSON.parse(result);
  }

  print.info('No secret keys found');
  return JSON.parse(template);
}

exports.readFixtureFile = function readFixtureFile(componentPath) {
  const fixtureFile = path.resolve(componentPath, './test/fixture.json');
  print.info(`Accessing test fixture file '${fixtureFile}'`);

  const fixtureFileExists = fs.existsSync(fixtureFile);

  if (!fixtureFileExists) {
    print.error('No fixture file found. Please define test fixtures in file test/fixture.json');
    throw new Error();
  }

  const content = fs.readFileSync(fixtureFile);
  const template = content.toString();
  const data = resolveSecretVariables(template, componentPath);
  return data.fixtures || {};
};

exports.provideProcessWithEnvVars = function provideProcessWithEnvVars(componentPath) {

  print.info('Reading env variables from /test/.globalEnv');
  const envFile = path.resolve(componentPath, './test/.globalEnv');
  const exists = fs.existsSync(envFile);

  if (exists) {
    require('dotenv').config({ path: envFile });
  } else {
    print.info('No env variables found');
  }
};

exports.readComponentJSON = function readComponentJSON(componentPath) {
  const file = fs.existsSync(path.resolve(componentPath, 'component.json'));
  if (!file) throw new Error('No component.json exists');

  const content = JSON.parse(fs.readFileSync(path.resolve(componentPath, 'component.json')));
  return content;
};

exports.validateFixture = function validateFixture(componentPath, fixture, actionName) {
  const component = exports.readComponentJSON(componentPath);

  if (actionName === 'verifyCredentials') return;

  const exists = (schemaPath) => {
    if (!fs.existsSync(path.resolve(componentPath, schemaPath))) {
      print.error(`Schema file ${schemaPath} missing`);
      return false;
    }
    return true;
  };

  let schema = {};

  const actionOrTrigger = component.actions[actionName] ? 'actions' : 'triggers';
  const action = component[actionOrTrigger][actionName];
  if (action.dynamicMetadata) {
    print.info('Dynamic schema; not performing any schema validation');
    return;
  }
  if (typeof action.metadata === 'string') {
    // get file
    if (!exists(action.metadata)) return;
    schema = require(path.resolve(componentPath, action.metadata));
  } else if (typeof action.metadata.in === 'string') {
    if (!exists(action.metadata.in)) return;
    if (!exists(action.metadata.out)) return;
    schema.in = require(path.resolve(componentPath, action.metadata.in));
    schema.out = require(path.resolve(componentPath, action.metadata.out));
  } else schema = action.metadata;

  if (!fixture.msg) {
    print.error('Fixture does not contain a msg field');
    return;
  }
  if (!fixture.msg.body) {
    print.error('Fixture does not contain a msg.body field');
    return;
  }

  const result = validate(fixture.msg.body, schema.in);
  if (result.errors.length) print.error('Errors from JSON schema validation:');
  else print.info('Fixture successfully validated against schema');

  result.errors.forEach((error) => {
    print.error(`\t${error.stack}`);
  });
};
