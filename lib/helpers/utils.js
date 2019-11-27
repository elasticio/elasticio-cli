const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const propParser = require('properties-parser');
const { print } = require('./theme');

exports.getComponentPath = (compPath) => fs.realpathSync(compPath, {});
exports.formatObject = (obj) => JSON.stringify(obj, null, 4);

exports.destroyProcess = function destroyProcess() {
  process.stdin.destroy();
};

exports.resolveComponent = function resolveComponent(compPath) {
  const componentPath = fs.realpathSync(compPath, {});
  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(componentPath);
};

function resolveSecretVariables(template) {
  const apiKeyFile = path.join(process.env.HOME, 'elastic.json');
  print.info('Adding secret keys');
  const apiKeyFileExists = fs.existsSync(apiKeyFile);

  if (apiKeyFileExists) {
    print.info(`Reading file ${apiKeyFile}`);
    const content = fs.readFileSync(apiKeyFile);
    const context = JSON.parse(content.toString());

    const parsed = handlebars.compile(template);
    const result = parsed(context);
    return JSON.parse(result);
  }

  print.info('No secret keys found');
  return JSON.parse(template);
}

exports.readFixtureFile = function readFixtureFile(componentPath) {
  const fixtureFile = path.resolve(componentPath, './test/fixture.json');
  print.info(`Reading test fixture from ${fixtureFile}`);

  const fixtureFileExists = fs.existsSync(fixtureFile);

  if (!fixtureFileExists) {
    print.error('No fixture file found. Please define test fixtures in file test/fixture.json');
    throw new Error();
  }

  const content = fs.readFileSync(fixtureFile);
  const template = content.toString();
  const data = resolveSecretVariables(template);
  return data.fixtures || {};
};

exports.provideProcessWithEnvVars = function provideProcessWithEnvVars() {
  let envVars = {};

  print.info('Reading env variables');
  const envFile = path.join(process.env.HOME, '.env');
  const exists = fs.existsSync(envFile);

  if (exists) {
    const content = fs.readFileSync(envFile);
    envVars = propParser.parse(content);
  } else {
    print.info('No env variables found');
  }

  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key];
  });
};

exports.readComponentJSON = function readComponentJSON(componentPath) {
  const file = fs.existsSync(path.resolve(componentPath, 'component.json'));
  if (!file) throw new Error('No component.json exists');

  const content = JSON.parse(fs.readFileSync(path.resolve(componentPath, 'component.json')));
  return content;
};
