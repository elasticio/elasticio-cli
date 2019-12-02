const { expect } = require('chai');
const { stub } = require('sinon');
const { Emitter } = require('../lib/helpers/emitter');
const { print } = require('../lib/helpers/theme');


describe('Emitter tests', () => {
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

  it('Has an emitter function', () => {
    const emitter = new Emitter();
    expect(typeof emitter.emit).to.be.equal('function');
    emitter.emit('data', 'hello');
    emitter.emit('error', 'this is an error');
    emitter.emit('snapshot', 'newSnapshot');
    emitter.emit('end');
    const info = print.info.getCalls();
    const data = print.data.getCalls();

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
