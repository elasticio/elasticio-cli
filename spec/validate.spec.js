/* eslint-disable no-plusplus, no-unused-expressions */
const { expect } = require('chai');
const { spy, stub } = require('sinon');
const path = require('path');
const tool = require('../lib/executables/validate');
const { print } = require('../lib/helpers/log.js');

const assert = {
  info: spy(tool.assert, 'info'),
  warn: spy(tool.assert, 'warn'),
  error: spy(tool.assert, 'error'),
};

describe('Tests for validation runner', () => {
  before(() => {
    Object.keys(print).forEach((method) => {
      stub(print, method).callsFake((msg) => msg);
    });
  });

  after(() => {
    Object.keys(print).forEach((method) => {
      print[method].restore();
    });
  });

  beforeEach(() => {
    Object.keys(assert).forEach((key) => { assert[key].resetHistory(); });
  });

  it('checks possible errors in the component.json', async () => {
    await tool.runValidate(path.resolve(__dirname, './test/component1'));
    const responses = [];
    Object.keys(assert).forEach((key) => {
      for (let i = 0; i < assert[key].callCount; i++) {
        const result = assert[key].getCall(i);
        if (!result.returnValue) responses.push(result.lastArg);
      }
    });

    const messages = [
      'component.json is valid JSON file',
      'No static schema files found',
      'component has no description',
      'No actions have been found',
      "trigger 'action1' is missing a description",
      'provided component credentials need to be wrapped in a `credentials` field and THEN a `fields` field as well',
      "file pathname for trigger 'action1' does not lead to a file",
      "trigger 'action1' has no metadata",
    ];

    messages.forEach((message) => {
      expect(responses).to.includes(message);
    });
  });

  it('checks possible errors in actions/triggers', async () => {
    await tool.runValidate(path.resolve(__dirname, './test/component2'));
    const responses = [];
    Object.keys(assert).forEach((key) => {
      for (let i = 0; i < assert[key].callCount; i++) {
        const result = assert[key].getCall(i);
        if (!result.returnValue) responses.push(result.lastArg);
      }
    });

    const messages = [
      'component.json is valid JSON file',
      "Functions found in action 'action1': ",
      "Functions found in action 'action2': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in action 'action3': \n\t\t - process",
      "Functions found in action 'action4': \n"
        + '\t\t - process\n'
        + '\t\t - init\n'
        + '\t\t - startup\n'
        + '\t\t - shutdown\n'
        + '\t\t - getMetaModel',
      "Functions found in action 'action5': \n\t\t - process",
      "Functions found in trigger '4BADNAME': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in trigger 'trigger2': \n"
        + '\t\t - process\n'
        + '\t\t - init\n'
        + '\t\t - startup\n'
        + '\t\t - shutdown\n'
        + '\t\t - getMetaModel',
      'All schema files are valid!',
      'component has no description',
      "credential field 'password' does not have a label",
      "action 'action1' is missing a description",
      "in action 'action3', process should be an async function",
      "in action 'action4', init should be an async function",
      "in action 'action4', startup should be an async function",
      "in action 'action4', shutdown should be an async function",
      "action 'action4' is missing IN metadata",
      "action 'action4' is missing OUT metadata",
      "in action 'action5', process should be an async function",
      "trigger '4BADNAME' is missing a description",
      "trigger '4BADNAME' is missing OUT metadata",
      "trigger 'trigger2' is missing a description",
      "in trigger 'trigger2', init should be an async function",
      "in trigger 'trigger2', startup should be an async function",
      "a startup function is defined in trigger 'trigger2', but startup functions will only run for triggers",
      "in trigger 'trigger2', shutdown should be an async function",
      "a startup function is defined in trigger 'trigger2', but shutdown functions will only run for triggers",
      "trigger 'trigger2' is missing OUT metadata",
      "field 'password' requires an object model for the dropdown",
      "field 'API-key' does not have a view class",
      'Invalid trigger names: ["4BADNAME"]. Names for triggers/actions must begin with a letter. They are case sensitive and may contain letters, digits  and underscores.',
      "action 'action1' is missing a title",
      "action 'action1' does not have a process function",
      "action 'action1' has dynamic metadata specified but no getMetaModel function",
      "action 'action3' has dynamic metadata specified but no getMetaModel function",
      "action 'action3', field '[object Object]' is missing a viewClass",
      "field 'action3' requires the dropdown for the model contain an object or a function in the action file\n"
        + "                \t=> Your model is: 'undefined'",
      "field 'action3' requires the dropdown for the model contain an object or a function in the action file\n"
        + "                \t=> Your model is: 'myModel'",
    ];

    messages.forEach((message) => {
      expect(responses).to.include(message);
    });
  });

  it('checks schema errors', async () => {
    await tool.runValidate(path.resolve(__dirname, './test/component3'));

    const responses = [];
    Object.keys(assert).forEach((key) => {
      for (let i = 0; i < assert[key].callCount; i++) {
        const result = assert[key].getCall(i);
        if (!result.returnValue) responses.push(result.lastArg);
      }
    });

    const messages = [
      'component.json is valid JSON file',
      "Functions found in action '2Bad': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in action 'action2': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in action 'action3': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in action 'action4': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in trigger 'trigger1': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in trigger 'trigger2': \n\t\t - process\n\t\t - getMetaModel",
      'component has no description',
      "credential field 'username' does not have a label",
      "action '2Bad' is missing OUT metadata",
      "action 'action2' is missing IN metadata",
      "action 'action2' is missing OUT metadata",
      "action 'action4' is missing OUT metadata",
      "action 'action6' is missing OUT metadata",
      "trigger 'trigger2' is missing OUT metadata",
      'Invalid action names: ["2Bad"]. Names for triggers/actions must begin with a letter. They are case sensitive and may contain letters, digits  and underscores.',
      "no file defined for action 'action5'. Please add a file to continue testing",
      `Error in action file 'action6', found at ${path.resolve(__dirname, './test/component3')}\n`
        + '      \t\t => ReferenceError: hello is not defined\n'
        + '      \tplease resolve this error to complete testing',
      'Schema trigger1 located at hello does not exist',
      'Schema 2Bad-out located at blah does not exist',
      'Schema action4-out located at hello does not exist',
      'Schema action6-out located at hello does not exist',
    ];

    messages.forEach((message) => {
      expect(responses).to.include(message);
    });
  });

  it('Checks uniqueness', async () => {
    try {
      await tool.runValidate(path.resolve(__dirname, './test/component4'));
    } catch (e) {
      expect(e.message).to.be.equal('Trigger/action names must be unique. Please resolve the name conflicts between action1 (/action.js) and action1 (/action.js)');
    }
  });

  it('Responds correctly for an accurate component.json', async () => {
    await tool.runValidate(path.resolve(__dirname, './test/component5'));

    const responses = [];
    Object.keys(assert).forEach((key) => {
      for (let i = 0; i < assert[key].callCount; i++) {
        const result = assert[key].getCall(i);
        if (!result.returnValue) responses.push(result.lastArg);
      }
    });

    const messages = [
      'component.json is valid JSON file',
      "Functions found in action 'action1': \n\t\t - process\n\t\t - getMetaModel",
      'All actions were validated!',
      "Functions found in trigger 'action2': \n\t\t - process\n\t\t - getMetaModel",
      "Functions found in trigger 'action3': \n\t\t - process\n\t\t - getMetaModel",
      'All actions were validated!',
      'All schema files are valid!',
      'component has no description',
      'component has no credentials',
    ];

    messages.forEach((message) => {
      expect(responses).to.include(message);
    });
  });
});
