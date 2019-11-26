const { expect } = require('chai');
const { stub } = require('sinon');
const { Logger } = require('../lib/logger');

describe('Logger function tests', () => {
  let logger;
  beforeEach(() => {
    logger = new Logger();
  });

  it('Correctly defines functions for each logger level', () => {
    const consoleStub = stub(console, 'log').callsFake((msg) => msg);
    logger.info('Hello');
    expect(consoleStub.getCall(0).lastArg).to.be.equal('Info: Hello');
    logger.debug('Hello');
    expect(consoleStub.getCall(1).lastArg).to.be.equal('Debug: Hello');
    logger.error('Hello');
    expect(consoleStub.getCall(2).lastArg).to.be.equal('Error: Hello');
    logger.warn('Hello');
    expect(consoleStub.getCall(3).lastArg).to.be.equal('Warn: Hello');
    logger.fatal('Hello');
    expect(consoleStub.getCall(4).lastArg).to.be.equal('Fatal: Hello');
    logger.trace('Hello');
    expect(consoleStub.getCall(5).lastArg).to.be.equal('Trace: Hello');
  });
});
