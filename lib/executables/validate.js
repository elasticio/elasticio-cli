/* eslint-disable no-use-before-define */
const assertion = require('assert');
const fs = require('fs');
const path = require('path');
const utils = require('../helpers/utils');
const { print } = require('../helpers/log');

const VIEW_CLASSES = [
  'TextFieldView', 'TextAreaView', 'CheckBoxView', 'SelectView', 'MultiSelectView', 'PasswordFieldView', 'OAuthFieldView',
];

const schemas = {};
let valid = true;

const assert = {
  info: (msg) => { print.info(`\t✅   ${msg}`); },
  warn: (val, msg) => {
    try {
      assertion(val, msg);
      return true;
    } catch (e) {
      print.warn(`\t ❕  ${msg}`);
      valid = false;
      return false;
    }
  },
  error: (val, msg) => {
    try {
      assertion(val, msg);
      return true;
    } catch (e) {
      print.error(`\t❌   ${msg}`);
      valid = false;
      return false;
    }
  },
};

exports.runValidate = async function runValidate(pathName) {
  print.info('Checking component.json for errors');
  const component = utils.readComponentJSON(pathName);
  assert.info('component.json is valid JSON file');

  assert.warn(component.title, 'component has no defined title');
  assert.warn(component.description, 'component has no description');
  assert.warn(component.credentials, 'component has no credentials');

  if (component.credentials) {
    const { fields } = component.credentials;
    assert.error(fields, 'provided component credentials need to be wrapped in a `credentials` field and THEN a `fields` field as well');
    if (fields) {
      Object.keys(fields).forEach((field) => {
        assert.warn(fields[field].label, `credential field '${field}' does not have a label`);
        const viewClass = assert.error(fields[field].viewClass, `field '${field}' does not have a view class`);
        if (viewClass) {
          assert.warn(VIEW_CLASSES.includes(fields[field].viewClass), `view class '${fields[field].viewClass}' in credential field '${field}' is not valid
            => Valid username classes are [${VIEW_CLASSES}]`);
        }
      });
    }
  }

  print.info('Checking actions...');
  assert.warn(component.actions, 'No actions have been found');

  if (component.actions) {
    Object.keys(component.actions).forEach((action) => {
      const details = component.actions[action];
      checkDetails(details, action, pathName, 'action');
    });
  }

  if (valid) assert.info('All actions were validated!');
  valid = false;

  print.info('Checking triggers...');
  assert.warn(component.triggers, 'No triggers have been found');

  if (component.triggers) {
    Object.keys(component.triggers).forEach((trigger) => {
      const details = component.triggers[trigger];
      checkDetails(details, trigger, pathName, 'trigger');
    });
  }

  if (valid) assert.info('All actions were validated!');
  valid = false;

  print.info('Checking schema files...');

  Object.keys(schemas).forEach((name) => {
    const schema = schemas[name];
    let file; let schemaExists;

    if (typeof schema === 'string') {
      schemaExists = fs.existsSync(path.resolve(pathName, schema));
      assert.error(schemaExists, `Schema ${name} located at ${schema} does not exist`);
      if (schemaExists) {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        file = require(path.resolve(pathName, schema));
      }
    }
    // eslint-disable-next-line no-unused-expressions
    file ? JSON.stringify(file) : JSON.stringify(schema);
  });

  if (valid) assert.info('All schema files are valid!');
  else if (!Object.keys(schemas).length) assert.info('No static schema files found');
};

const checkDetails = (details, name, pathName, type) => {
  assert.error(details.title, `${type} '${name}' is missing a title`);
  assert.warn(details.description, `${type} '${name}' is missing a description`);
  assert.error(details.main, `no file defined for ${type} '${name}'`);
  const actionExists = fs.existsSync(path.resolve(pathName, details.main));
  assert.error(actionExists, `file pathname for ${type} '${name}' does not lead to a file`);

  if (actionExists) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const actionFile = require(path.resolve(pathName, details.main));
      assert.error(actionFile.process, `${type} '${name}' does not have a process function`);
      if (details.dynamicMetadata) {
        assert.error(actionFile.getMetaModel, `${type} '${name}' has dynamic metadata specified but no getMetaModel function`);
      }
    } catch (e) {
      assert.error(false, `Error in ${type} file '${name}', found at ${pathName}
      \t\t => ${e}
      \tplease resolve this error to complete testing`);
    }
  }

  assert.error(details.dynamicMetadata || details.metadata, `${type} '${name}' has no metadata`);
  if (details.metadata) {
    if (type === 'action') assert.warn(details.metadata.in, `${type} '${name}' is missing IN metadata`);
    assert.warn(details.metadata.out, `${type} '${name}' is missing OUT metadata`);
    if (details.metadata.in && details.metadata.out) {
      const actionOut = `${name}-out`;
      const actionIn = `${name}-in`;
      if (type === 'action') schemas[actionOut] = details.metadata.in;
      schemas[actionIn] = details.metadata.out;
    }
  }
};

exports.assert = assert;
