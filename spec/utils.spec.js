const { expect } = require('chai');
const path = require('path');
const sinon = require('sinon');
const utils = require('../lib/helpers/utils');
const { print } = require('../lib/helpers/log');

const COMPONENT_PATH = path.resolve(__dirname, './test-component');

const fixture = {
  cfg: {},
  msg: {
    body: 'potato',
  },
};

describe('Tests for util functions', () => {
  describe('Tests for schema validation', () => {
    beforeEach(() => {
      Object.keys(print).forEach((method) => {
        sinon.stub(print, method).callsFake((msg) => msg);
      });
    });

    afterEach(() => {
      Object.keys(print).forEach((method) => {
        print[method].restore();
      });
    });

    it('Checks invalid schema', () => {
      utils.validateFixture(COMPONENT_PATH, fixture, 'bigAction');
      const errors = print.error.getCalls();
      expect(errors.length).to.be.equal(2);
      expect(errors[0].lastArg).to.be.equal('Errors from JSON schema validation:');
      expect(errors[1].lastArg).to.be.equal('\tinstance is not of a type(s) number');
    });

    it('Runs schemas for metadata hardcoded to component.json', () => {
      utils.validateFixture(COMPONENT_PATH, fixture, 'action3');
      const info = print.info.getCalls();
      expect(info.length).to.be.equal(1);
      expect(info[0].lastArg).to.be.equal('Fixture successfully validated against schema');
    });

    it('Returns success for dynamic metdata', () => {
      utils.validateFixture(COMPONENT_PATH, fixture, 'action4');
      const info = print.info.getCalls();
      expect(info.length).to.be.equal(1);
      expect(info[0].lastArg).to.be.equal('Dynamic schema for action4; not performing any schema validation');
    });

    it('Produces an error when schema files haven\'t been found', async () => {
      expect(utils.validateFixture.bind({}, COMPONENT_PATH, fixture, 'action5')).to.throw();
      const errors = print.error.getCalls();
      expect(errors.length).to.be.equal(1);
      expect(errors[0].lastArg).to.be.equal('Schema file ./fakeFile.json missing');
    });
  });
});
