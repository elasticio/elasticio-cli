const { print } = require('../helpers/theme.js');
const prompts = require('../helpers/prompts.js');
const utils = require('../helpers/utils.js');
const { Emitter } = require('../helpers/emitter.js');

exports.runProcess = async function runProcess(path, fixtureKey, action) {
  const fixture = await prompts.setupFixture(fixtureKey, path);
  const component = utils.resolveComponent(path);

  const fn = component.process;

  const msg = fixture.msg || {};
  const cfg = fixture.cfg || {};
  const snapshot = fixture.snapshot || {};

  utils.provideProcessWithEnvVars();

  const emitter = new Emitter();

  try {
    fn.apply(emitter, [msg, cfg, snapshot]);
  } catch (e) {
    print.error(e.stack);
  } finally {
    utils.destroyProcess();
  }
};
