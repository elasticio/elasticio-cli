/* eslint-disable import/no-dynamic-require, global-require */
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const propParser = require('properties-parser');
const { validate } = require('jsonschema');
const { parse } = require('dotenv');
const { print } = require('./log');
const _ = require('lodash');

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

function loadSchema(componentPath, metadataObject) {
  // Not setting any metadata is valid.
  if (metadataObject === undefined) {
    return;
  }

  if (!_.isPlainObject(metadataObject)) {
    print.error('Metadata needs to be an JSON object (or undefined)');
    throw new Error();
  }

  const wrongMetadataKeys = Object.keys(metadataObject).filter(k => k !== 'out' && k !== 'in')
  if (wrongMetadataKeys.length > 0) {
    print.warn(`The metadata object should only contain "in" and "out".   Not: ${wrongMetadataKeys.join(', ')}`);
  }

  return {
    in: loadSchemaSegment(componentPath, metadataObject.in),
    out: loadSchemaSegment(componentPath, metadataObject.out)
  };
}

function loadSchemaSegment(componentPath, metadataSegment) {
  if(metadataSegment === undefined) {
    return;
  }

  if(typeof metadataSegment === 'string') {
    const metadataFilePath = path.resolve(componentPath, metadataSegment);
    if (!fs.existsSync(metadataFilePath)) {
      print.error(`Schema file ${metadataSegment} missing`);
      throw new Error();
    }
    let metadata;
    try {
      metadata = require(metadataFilePath);
    } catch {
      print.error(`Schema file ${metadataSegment} appears not to be valid JSON.`);
      throw new Error();
    }
    if (!_.isPlainObject(metadata)) {
      print.error(`Metadata in ${metadataSegment} needs to be a plain JSON object.`);
      throw new Error();
    }
    return metadata;
  }

  if (!_.isPlainObject(metadataSegment)) {
    print.error('Metadata in & out need to be either undefined, plain objects or strings that point to files with plain objects.');
    throw new Error();
  }

  return metadataSegment;
}

exports.validateFixture = function validateFixture(componentPath, fixture, actionName) {
  const component = exports.readComponentJSON(componentPath);

  if (actionName === 'verifyCredentials') return;

  if (!fixture.msg) {
    print.error('Fixture does not contain a msg field');
    return;
  }
  if (!fixture.msg.body) {
    print.error('Fixture does not contain a msg.body field');
    return;
  }

  const actionOrTrigger = component.actions[actionName] ? 'actions' : 'triggers';
  const action = component[actionOrTrigger][actionName];
  if (action.dynamicMetadata) {
    print.info('Dynamic schema; not performing any schema validation');
    return;
  }

  const schema = loadSchema(componentPath, action.metadata);

  if (schema === undefined || schema.out === undefined || _.isEmpty(schema.out)) {
    print.warn(`${actionName} does not have out metadata.  It will not be possible to auto-generate samples for this action/trigger.`);
  }
  if (actionOrTrigger === 'actions' && (schema === undefined || schema.in === undefined || _.isEmpty(schema.in))) {
    print.warn(`${actionName} does not have in metadata.  This means that there will be no mapping step before this action.  This may not be what you want.`);
  }

  if(!schema || !schema.in  || _.isPlainObject(schema.in)) {
    print.info('No in schema; not performing any schema validation');
    return;
  }

  const result = validate(fixture.msg.body, schema.in);
  if (result.errors.length) print.error('Errors from JSON schema validation:');
  else print.info('Fixture successfully validated against schema');

  result.errors.forEach((error) => {
    print.error(`\t${error.stack}`);
  });
};
