/* eslint-disable no-unused-expressions, no-use-before-define */
const assertion = require('assert');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const utils = require('../helpers/utils');
const { print } = require('../helpers/log');

const VIEW_CLASSES = [
  'TextFieldView', 'TextAreaView', 'CheckBoxView', 'SelectView', 'MultiSelectView', 'PasswordFieldView', 'OAuthFieldView',
];

const EXTENDED_VIEW_CLASES = [
  'TextFieldView',
  'TextFieldWithNoteView',
  'PasswordFieldView',
  'CheckBoxView',
  'CodeFieldView',
  'TextAreaView',
  'TextAreaWithNoteView',
  'SelectView',
  'MultiSelectView',
  'SelectTreeView',
  'SelectPropertyView',
  'OAuthFieldView',
  'WebHookPayloadView',
  'OutMetadataView',
  'InMetadataExtensionView',
  'CSVReadView',
  'CSVWriteView',
  'JSONataView',
  'RESTAPIView',
  'HTTPAuthView',
  'WebhookAuthView',
];

let schemas = {};
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
  schemas = {};
  print.info(`Running in ${pathName}`);
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
          assert.warn(EXTENDED_VIEW_CLASES.includes(fields[field].viewClass), `view class '${fields[field].viewClass}' in credential field '${field}' is not valid
            => Valid username classes are [${VIEW_CLASSES}]`);
          if (fields[field].viewClass === 'SelectView') {
            assert.error(typeof fields[field].model === 'object', `field '${field}' requires an object model for the dropdown`);
          }
        }
      });
    }
  }

  assureFuncsUniqNaming(component);
  assureFuncsValidNaming(component);

  print.info('Checking actions...');
  valid = true;
  assert.warn(component.actions, 'No actions have been found');

  component.actions && Object.keys(component.actions).forEach((action) => {
    checkFuncDetails(component.actions[action], action, pathName, 'action');
  });

  if (valid) assert.info('All actions were validated!');
  valid = true;

  print.info('Checking triggers...');
  assert.warn(component.triggers, 'No triggers have been found');

  component.triggers && Object.keys(component.triggers).forEach((trigger) => {
    checkFuncDetails(component.triggers[trigger], trigger, pathName, 'trigger');
  });

  if (valid) assert.info('All actions were validated!');
  valid = true;

  print.info('Checking schema files...');

  Object.keys(schemas).forEach((name) => {
    const schema = schemas[name];
    let schemaExists;

    if (typeof schema === 'string') {
      schemaExists = fs.existsSync(path.resolve(pathName, schema));
      assert.error(schemaExists, `Schema ${name} located at ${schema} does not exist`);
      if (schemaExists) {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        require(path.resolve(pathName, schema));
      }
    }
  });

  if (!Object.keys(schemas).length) assert.info('No static schema files found');
  else if (valid) assert.info('All schema files are valid!');
};

/**
 * Validates actions and triggers
 * @param {object} details
 * @param {string} name name of action/trigger
 * @param {string} pathName path to component
 * @param {string} type one of action/trigger
 */
const checkFuncDetails = (details, name, pathName, type) => {
  assert.error(details.title, `${type} '${name}' is missing a title`);
  assert.warn(details.description, `${type} '${name}' is missing a description`);
  assert.error(details.main, `no file defined for ${type} '${name}'. Please add a file to continue testing`);
  if (!details.main) return;
  const actionExists = fs.existsSync(path.resolve(pathName, details.main));
  assert.error(actionExists, `file pathname for ${type} '${name}' does not lead to a file`);
  assert.error(details.dynamicMetadata || details.metadata, `${type} '${name}' has no metadata`);

  if (actionExists) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const actionFile = require(path.resolve(pathName, details.main));
      const functs = Object.keys(actionFile).reduce((acc, action) => `${acc}\n\t\t - ${action}`, '');
      assert.info(`Functions found in ${type} '${name}': ${functs}`);
      assert.error(actionFile.process, `${type} '${name}' does not have a process function`);
      if (actionFile.init) {
        assert.warn(actionFile.init.constructor.name === 'AsyncFunction', `in ${type} '${name}', init should be an async function`);
      }
      if (actionFile.startup) {
        assert.warn(actionFile.startup.constructor.name === 'AsyncFunction', `in ${type} '${name}', startup should be an async function`);
        assert.warn(type === 'action', `a startup function is defined in ${type} '${name}', but startup functions will only run for triggers`);
      }
      if (actionFile.shutdown) {
        assert.warn(actionFile.shutdown.constructor.name === 'AsyncFunction', `in ${type} '${name}', shutdown should be an async function`);
        assert.warn(type === 'action', `a startup function is defined in ${type} '${name}', but shutdown functions will only run for triggers`);
      }
      if (actionFile.process) {
        assert.warn(actionFile.process.constructor.name === 'AsyncFunction', `in ${type} '${name}', process should be an async function`);
      }
      if (details.dynamicMetadata) {
        assert.error(actionFile.getMetaModel, `${type} '${name}' has dynamic metadata specified but no getMetaModel function`);
      }
      if (details.fields) {
        Object.keys(details.fields).forEach((f) => {
          const field = details.fields[f];
          assert.error(field.viewClass, `${type} '${name}', field '${field}' is missing a viewClass`);
          if (field.viewClass) {
            assert.warn(EXTENDED_VIEW_CLASES.includes(field.viewClass), `view class '${field.viewClass}' in credential field '${name}' is not valid
                => Valid username classes are [${VIEW_CLASSES}]`);
            if (field.viewClass === 'SelectView') {
              assert.error(typeof field.model === 'object' || (typeof field.model === 'string' && actionFile[field.model]),
                `field '${name}' requires the dropdown for the model contain an object or a function in the ${type} file
                \t=> Your model is: '${field.model}'`);
            }
          }
        });
      }
    } catch (e) {
      assert.error(false, `Error in ${type} file '${name}', found at ${pathName}
      \t\t => ${e}
      \tplease resolve this error to complete testing`);
    }
  }

  if (details.metadata) {
    if (typeof details.metadata === 'string') {
      const schemaExists = fs.existsSync(path.resolve(pathName, details.metadata));
      assert.error(schemaExists, `Schema ${name} located at ${details.metadata} does not exist`);
      if (schemaExists) {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const file = require(path.resolve(pathName, details.metadata));
        if (type === 'action') assert.warn(file.in, `${type} '${name}' is missing IN metadata`);
        assert.warn(file.out, `${type} '${name}' is missing OUT metadata`);
      }
    } else {
      if (type === 'action') assert.warn(details.metadata.in, `${type} '${name}' is missing IN metadata`);
      assert.warn(details.metadata.out, `${type} '${name}' is missing OUT metadata`);
      if (details.metadata.in || details.metadata.out) {
        const actionOut = `${name}-out`;
        const actionIn = `${name}-in`;
        if (type === 'action') schemas[actionOut] = details.metadata.in;
        schemas[actionIn] = details.metadata.out;
      }
    }
  }
};

function assureFuncsUniqNaming(component) {
  if (!component.triggers || !component.actions) {
    return;
  }

  // eslint-disable-next-line max-len
  const notUniqMethods = _.intersection(Object.keys(component.triggers), Object.keys(component.actions));

  if (notUniqMethods.length) {
    const smartlyListedFilesWithIssues = (
      notUniqMethods.map((method) => {
        const triggerName = component.triggers[method].main.slice(2);
        const actionName = component.actions[method].main.slice(2);
        return `${method} (${triggerName}) and ${method} (${actionName})`;
      }).join(', ')
    );

    throw new Error(`Trigger/action names must be unique. Please resolve the name conflicts between ${smartlyListedFilesWithIssues}`);
  }
}

function assureFuncsValidNaming(component) {
  const { triggers, actions } = component;
  // regex for valid javascript variable (except $, and starts only with letter)
  const validVariable = new RegExp(/^[A-Za-z]+[\w_]*$/);
  const invalidTriggerNames = Object.keys(triggers || {}).filter((t) => !validVariable.test(t));
  const invalidActionNames = Object.keys(actions || {}).filter((a) => !validVariable.test(a));
  const errorReason = 'Names for triggers/actions must begin with a letter. '
    + 'They are case sensitive and may contain letters, digits  and underscores.';

  let errorStr = '';

  if (triggers && invalidTriggerNames.length) errorStr += `Invalid trigger names: [${invalidTriggerNames.map((t) => `"${t}"`)}]. `;
  if (actions && invalidActionNames.length) errorStr += `Invalid action names: [${invalidActionNames.map((a) => `"${a}"`)}]. `;
  if (errorStr) assert.error(false, errorStr + errorReason);
}

exports.assert = assert;
