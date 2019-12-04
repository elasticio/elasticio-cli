const { expect } = require('chai');
const utils = require('../lib/helpers/utils');

describe('Tests for util functions', () => {
  describe('Tests for readEnvVariables functions', () => {
    it('Reads global env variables and adds them to PROCESS.ENV', () => {
      utils.provideProcessWithEnvVars('./spec');
      expect(process.env.ENVIRONMENT_VAR).to.be.equal('1234');
    });
  });
});
