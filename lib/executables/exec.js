const { print } = require('../helpers/log.js');
const utils = require('../helpers/utils.js');
const prompts = require('../helpers/prompts.js');
const { Emitter } = require('../helpers/emitter.js');

exports.runExec = async function runExec(componentPath, functionName, fixtureKey, action) {
  const path = await prompts.getActionPath(componentPath, action);
  const fn = await prompts.setupFunction(functionName, path);
  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  const cfg = fixture.cfg || {};
  const msg = fixture.msg || {};
  const snapshot = fixture.snapshot || {};
  const emitter = new Emitter();

  utils.provideProcessWithEnvVars();

  try {
    fn.apply(emitter, [msg, cfg, snapshot]);
    utils.destroyProcess();
  } catch (e) {
    print.error(e.stack);
    utils.destroyProcess();
  }
};
