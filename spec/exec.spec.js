/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const inquirer = require('inquirer');
const { runExec } = require('../lib/executables/exec');
const { print } = require('../lib/helpers/theme.js');

const PATH = './spec/test-component';

describe('Tests for exec', () => {
  before(() => {
    Object.keys(print).forEach((method) => {
      sinon.stub(print, method).callsFake((msg) => msg);
    });
  });

  after(() => {
    Object.keys(print).forEach((method) => {
      print[method].restore();
    });
  });
  const inquirerStub = sinon.stub(inquirer, 'prompt').callsFake(async (question) => {
    const answer = {};
    if (question.name === 'select') answer.select = 'action';
    if (question.name === 'action') answer.action = 'bigAction';
    if (question.name === 'function') answer.function = 'process';
    if (question.name === 'fixture') answer.fixture = 'main';
    return answer;
  });

  describe('Correctly asks for prompting if and only if necessary', () => {
    afterEach(() => {
      inquirerStub.resetHistory();
      Object.keys(print).forEach((method) => { print[method].resetHistory(); });
    });

    it('Asks for all prompts when no flags are given', async () => {
      await runExec(PATH, null, null, null);
      const calls = inquirerStub.getCalls();

      expect(calls.length).to.be.equal(4);
      expect(calls[0].lastArg.name).to.be.equal('select');
      expect(calls[1].lastArg.name).to.be.equal('fixture');
      expect(calls[2].lastArg.name).to.be.equal('action');
      expect(calls[3].lastArg.name).to.be.equal('function');
    });

    it('Asks for correct prompts when function is given', async () => {
      await runExec(PATH, 'process', null, null);
      const calls = inquirerStub.getCalls();

      expect(calls.length).to.be.equal(2);
      expect(calls[0].lastArg.name).to.be.equal('fixture');
      expect(calls[1].lastArg.name).to.be.equal('action');
    });

    it('Asks for correct prompts when action name is given', async () => {
      await runExec(PATH, null, null, 'bigAction');
      const calls = inquirerStub.getCalls();

      expect(calls.length).to.be.equal(2);
      expect(calls[0].lastArg.name).to.be.equal('fixture');
      expect(calls[1].lastArg.name).to.be.equal('function');
    });

    it('Behaves correctly when conflicting prompts are provided', async () => {
      await runExec(PATH, 'verify', null, 'bigAction');
      const calls = inquirerStub.getCalls();

      expect(calls.length).to.be.equal(1);
      expect(calls[0].lastArg.name).to.be.equal('fixture');
    });
  });

  describe('Correctly runs functions', () => {
    afterEach(() => {
      inquirerStub.resetHistory();
      Object.keys(print).forEach((method) => { print[method].resetHistory(); });
    });

    it('Correctly runs verifyCredentials', async () => {
      await runExec(PATH, 'verify', 'validCredentials', null);
      const data = print.data.getCalls();
      expect(JSON.parse(data[0].lastArg)).to.be.deep.equal({ verified: true });
    });

    it('Correctly runs process', async () => {
      await runExec(PATH, 'verify', 'main', null);
      const data = print.error.getCalls();
      expect(data[0].lastArg).to.be.equal('Emitting failure error');
      expect(JSON.parse(data[1].lastArg)).to.be.deep.equal({ verified: false, reason: 'Verification failed' });
    });

    it('Correctly runs other exported functions', async () => {
      await runExec(PATH, 'funFunction', null, null);
      const data = print.data.getCalls();
      expect(JSON.parse(data[0].lastArg)).to.be.deep.equal([
        'Get enough sleep',
        'Drink water',
        'Go outside',
      ]);
    });
  });
});
