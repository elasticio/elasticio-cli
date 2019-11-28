const { expect } = require('chai');
const { stub } = require('sinon');
const { Emitter } = require('../lib/helpers/emitter');

describe('Emitter tests', () => {
  it('Has an emitter function', () => {
    const consoleStub = stub(console, 'log').callsFake((msg) => msg);
    const emitter = new Emitter();
    expect(typeof emitter.emit).to.be.equal('function');
    emitter.emit('data', 'hello');
    expect(consoleStub.getCall(0).lastArg).to.include('Component returned following message:');
    expect(consoleStub.getCall(1).lastArg).to.include('hello');
    emitter.emit('error', { stack: 'this is an error' });
    expect(consoleStub.getCall(2).lastArg).to.include('this is an error');
    emitter.emit('snapshot', 'newSnapshot');
    expect(consoleStub.getCall(4).lastArg).to.include('newSnapshot');
    emitter.emit('end');
    expect(consoleStub.getCall(5).lastArg).to.include('Component execution done');
    consoleStub.restore();
  });

  it('Has a logger function', () => {
    const consoleStub = stub(console, 'log').callsFake((msg) => msg);
    const emitter = new Emitter();
    const { logger } = emitter;
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
    consoleStub.restore();
  });
});
