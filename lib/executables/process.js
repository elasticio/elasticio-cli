const _ = require('lodash');
const fs = require('fs');
const vm = require('vm');
const request = require('co-request');
const { messages } = require('elasticio-node');
const prompts = require('../helpers/prompts.js');
const utils = require('../helpers/utils.js');
const { Emitter, EmitterError } = require('../helpers/emitter.js');

function wait(timeout) {
  return new Promise((ok) => {
    setTimeout(() => {
      this.logger.debug('Done wait');
      ok();
    }, timeout);
    this.logger.debug('Start wait sec=%s', timeout);
  });
}

exports.runProcess = async function runProcess(componentPath, fixtureKey, action) {
  const actionData = await prompts.getActionPath(componentPath, action);
  const { path } = actionData;
  const actionName = actionData.name;

  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  utils.validateFixture(componentPath, fixture, actionName);
  const vmExports = {};
  const context = vm.createContext({
    // Node globals
    Buffer,
    clearInterval,
    clearTimeout,
    console,
    exports: vmExports,
    global: {},
    module: { exports: vmExports },
    require,
    setInterval,
    setTimeout,
    URL,
    URLSearchParams,

    // elasticio specific functionality
    emitter: this,
    messages,

    // other libraries
    _,
    request,
    wait: wait.bind(this),
  });

  const code = fs.readFileSync(path);
  vm.runInContext(code, context);
  const {
    startup, init, process, shutdown,
  } = context.exports;

  const msg = fixture.msg || {};
  const cfg = fixture.cfg || {};
  const snapshot = fixture.snapshot || {};

  utils.provideProcessWithEnvVars(componentPath);

  const emitter = new Emitter();

  try {
    let startupData;
    if (startup) startupData = await startup(cfg);
    if (init) await init(cfg);
    const processData = await process.apply(emitter, [msg, cfg, snapshot]);
    if (processData !== undefined && processData !== null) emitter.emit('data', processData);
    if (shutdown) await shutdown(cfg, startupData);
  } catch (e) {
    if (e instanceof EmitterError) {
      throw e;
    }
    emitter.emit('error', e);
  } finally {
    utils.destroyProcess();
  }
};
