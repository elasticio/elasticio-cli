const { print } = require('../helpers/log.js');
const utils = require('../helpers/utils.js');
const prompts = require('../helpers/prompts.js');
const { Emitter } = require('../helpers/emitter.js');

exports.runExec = async function runExec(componentPath, functionName, fixtureKey, action) {
  const verifyOrAction = functionName || (action ? 'action' : await prompts.verifyOrAction());
  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  const emitter = new Emitter();
  const cfg = fixture.cfg || {};
  const msg = fixture.msg || {};
  const snapshot = fixture.snapshot || {};
  utils.provideProcessWithEnvVars();
  let fn;

  if (verifyOrAction === 'verifyCredentials' || verifyOrAction === 'verify') {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    fn = require(path.resolve(componentPath, 'verifyCredentials'));
    if (Object.keys(fn).length) fn = fn.verify;
  } else {
    const actionPath = await prompts.getActionPath(componentPath, action);
    fn = await prompts.setupFunction(functionName, actionPath);
  }

  print.info(`\nRunning function '${fn.name}'`);
  print.info('\nResult: \n');

  if (fn.name === 'verify') {
    let response;
    try {
      response = await fn.call(emitter, cfg, (e, result) => {
        if (e) throw e;
        else if (result) return result;
      }, snapshot);
      if (!Object.keys(response).includes('verified')) response = { verified: response };
      print.data(utils.formatObject(response));
    } catch (e) {
      print.error(utils.formatObject({
        verified: false,
        reason: e.context || e.message,
      }));
    } finally {
      utils.destroyProcess();
    }
  } else if (fn.name === 'process') {
    await runFunction(fn, emitter, [msg, cfg, snapshot]);
  } else {
    await runFunction(fn, emitter, [cfg, snapshot]);
  }
};

const runFunction = async (fn, emitter, params) => {
  try {
    const result = await fn.apply(emitter, params);
    if (result) print.data(utils.formatObject(result));
  } catch (e) {
    print.error(e.stack);
  } finally {
    utils.destroyProcess();
  }
};
