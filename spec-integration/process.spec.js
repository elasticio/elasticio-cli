/* eslint-disable no-unused-expressions */
require('dotenv').config();
const chai = require('chai');
chai.use(require('chai-as-promised'));
const sinon = require('sinon');
const { Emitter } = require('../lib/helpers/emitter');
const { runProcess } = require('../lib/executables/process');

const { expect } = chai;

const COMPONENT_PATH = 'spec-integration/test-component';
const FIXTURE_KEY = 'success';
let action = '';

const spy = sinon.spy(Emitter.prototype, 'emit');

describe('runProcess', () => {
  beforeEach(() => {
    spy.resetHistory();
    action = '';
  });

  it('should run a basic process that emits', async () => {
    action = 'basicEmit';
    await runProcess(COMPONENT_PATH, FIXTURE_KEY, action);
    const emit1 = spy.getCall(0).args;
    expect(emit1[0]).to.equal('data');
    expect(emit1[1]).to.deep.equal({
      prop: 'foobar',
    });
  });

  it('should run a process that has many emits', async () => {
    action = 'manyEmits';
    await runProcess(COMPONENT_PATH, FIXTURE_KEY, action);
    const emit1 = spy.getCall(0).args;
    expect(emit1[0]).to.equal('data');
    expect(emit1[1]).to.deep.equal({
      prop1: 'foobar1',
    });
    const emit2 = spy.getCall(1).args;
    expect(emit2[0]).to.equal('snapshot');
    expect(emit2[1]).to.deep.equal({
      timestamp1: 123,
    });
    const emit3 = spy.getCall(2).args;
    expect(emit3[0]).to.equal('data');
    expect(emit3[1]).to.deep.equal({
      prop2: 'foobar2',
    });
    const emit4 = spy.getCall(3).args;
    expect(emit4[0]).to.equal('end');
  });

  it('should throw when array data is emitted', async () => {
    action = 'arrayEmit';
    await expect(runProcess(COMPONENT_PATH, FIXTURE_KEY, action)).to.eventually.be.rejectedWith('The argument for this event must be a JSON');
  });

  it('should throw when string data is emitted', async () => {
    action = 'stringEmit';
    await expect(runProcess(COMPONENT_PATH, FIXTURE_KEY, action)).to.eventually.be.rejectedWith('The argument for this event must be a JSON');
  });

  it('should throw when process tries to emit an invalid event name', async () => {
    action = 'invalidEventEmit';
    await expect(runProcess(COMPONENT_PATH, FIXTURE_KEY, action)).to.eventually.be.rejectedWith('The event type invalidEventName is not recognized');
  });

  it('should emit a thrown error', async () => {
    action = 'thrownError';
    await runProcess(COMPONENT_PATH, FIXTURE_KEY, action);
    const emit1 = spy.getCall(0).args;
    expect(emit1[0]).to.equal('error');
    expect(emit1[1].message).to.equal('Thrown');
  });

  it('should emit return values as data', async () => {
    action = 'returnData';
    await runProcess(COMPONENT_PATH, FIXTURE_KEY, action);
    const emit1 = spy.getCall(0).args;
    expect(emit1[0]).to.equal('data');
    expect(emit1[1]).to.deep.equal({
      prop: 'foobar',
    });
    const emit2 = spy.getCall(1).args;
    expect(emit2[0]).to.equal('data');
    expect(emit2[1]).to.deep.equal({
      data: 'foobar2',
    });
  });
});
