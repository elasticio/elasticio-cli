const prompts = require('../helpers/prompts.js');
const utils = require('../helpers/utils.js');
const { Emitter, EmitterError } = require('../helpers/emitter.js');

exports.runProcess = async function runProcess(componentPath, fixtureKey, action) {
  const path = await prompts.getActionPath(componentPath, action);
  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  const component = utils.resolveComponent(path);

  const {
    startup, init, process, shutdown,
  } = component;

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
