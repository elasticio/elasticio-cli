const prompts = require('../helpers/prompts.js');
const utils = require('../helpers/utils.js');
const { Emitter, EmitterError } = require('../helpers/emitter.js');

exports.runProcess = async function runProcess(componentPath, fixtureKey, action) {
  const path = await prompts.getActionPath(componentPath, action);
  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  const component = utils.resolveComponent(path);

  const fn = component.process;

  const msg = fixture.msg || {};
  const cfg = fixture.cfg || {};
  const snapshot = fixture.snapshot || {};

  utils.provideProcessWithEnvVars(componentPath);

  const emitter = new Emitter();

  try {
    const ret = await fn.apply(emitter, [msg, cfg, snapshot]);
    if (ret !== undefined && ret !== null) emitter.emit('data', ret);
  } catch (e) {
    if (e instanceof EmitterError) {
      throw e;
    }
    emitter.emit('error', e);
  } finally {
    utils.destroyProcess();
  }
};
