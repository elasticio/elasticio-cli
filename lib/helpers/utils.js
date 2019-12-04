const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const { parse } = require('dotenv');
const { print } = require('./log');

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
