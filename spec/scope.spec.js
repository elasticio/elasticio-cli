const { expect } = require('chai');
const { stub } = require('sinon');
const { Emitter } = require('../lib/helpers/emitter');
const { print } = require('../lib/helpers/log');


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

    expect(info[0].lastArg).to.include('Component returned following message:');
    expect(info[1].lastArg).to.include('Component returned following snapshot:');
    expect(info[2].lastArg).to.include('Component execution done');
    expect(JSON.parse(data[0].lastArg)).to.be.equal('hello');
    expect(JSON.parse(data[1].lastArg)).to.be.equal('newSnapshot');

    Object.keys(print).forEach((method) => {
      print[method].resetHistory();
    });
  });
});
