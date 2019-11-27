const { print } = require('../helpers/theme.js');
const utils = require('../helpers/utils.js');
const prompts = require('../helpers/prompts.js');
const { Emitter } = require('../helpers/emitter.js');

exports.runExec = async function runExec(path, functionName, fixtureKey, action) {
  const fn = await prompts.setupFunction(functionName, path);
  const fixture = await prompts.setupFixture(fixtureKey, path);
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
