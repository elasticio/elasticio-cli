/* eslint-disable no-plusplus, no-unused-expressions */
const { expect } = require('chai');
const { spy } = require('sinon');
const path = require('path');
const tool = require('../lib/executables/validate');

const assert = {
  info: spy(tool.assert, 'info'),
  warn: spy(tool.assert, 'warn'),
  error: spy(tool.assert, 'error'),
};

describe('Tests for validation runner', () => {
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
      "action 'action1' is missing a description",
      'No triggers have been found',
      'provided component credentials need to be wrapped in a `credentials` field and THEN a `fields` field as well',
      "file pathname for action 'action1' does not lead to a file",
      "action 'action1' has no metadata",
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
      'component has no description',
      "credential field 'username' does not have a label",
      "action 'action1' is missing a description",
      "action 'action4' is missing IN metadata",
      "action 'action4' is missing OUT metadata",
      "trigger 'trigger1' is missing a description",
      "trigger 'trigger1' is missing OUT metadata",
      "action 'action1' is missing a title",
      "action 'action1' does not have a process function",
      "action 'action1' has dynamic metadata specified but no getMetaModel function",
      "action 'action3' has dynamic metadata specified but no getMetaModel function"
    ];

    messages.forEach((message) => {
      expect(responses).to.include(message);
    });
  });
});
