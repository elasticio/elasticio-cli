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
});
