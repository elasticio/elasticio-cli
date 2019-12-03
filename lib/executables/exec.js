/* eslint-disable no-use-before-define */
const { print } = require('../helpers/log.js');
const utils = require('../helpers/utils.js');
const prompts = require('../helpers/prompts.js');
const { Emitter } = require('../helpers/emitter.js');

exports.runExec = async function runExec(componentPath, functionName, fixtureKey, action) {
  const verifyOrAction = functionName || action || await prompts.verifyOrAction();
  const fixture = await prompts.setupFixture(fixtureKey, componentPath);
  const actionData = await prompts.getActionPath(componentPath, verifyOrAction);
  const properPath = actionData.path;
  const actionName = actionData.name;

  utils.validateFixture(componentPath, fixture, actionName);

  const setup = await prompts.setupFunction(verifyOrAction, properPath);
  let func = setup.path;
  const funcName = setup.name;

  if (Object.keys(func).length) {
    func = func[Object.keys(func)[0]];
  }

  const emitter = new Emitter();
  const cfg = fixture.cfg || {};
  const msg = fixture.msg || {};
  const snapshot = fixture.snapshot || {};
  utils.provideProcessWithEnvVars(componentPath);

  print.info(`\nRunning function '${funcName}'`);
  print.info('\nResult: \n');

  if (funcName === 'verify') {
    let response;
    try {
      response = await func.call(emitter, cfg, (e, result) => {
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
  } else if (funcName === 'process') {
    await runFunction(func, emitter, [msg, cfg, snapshot]);
  } else {
    await runFunction(func, emitter, [cfg, snapshot]);
  }
};

const runFunction = async (func, emitter, params) => {
  try {
    const result = await func.apply(emitter, params);
    if (result) print.data(utils.formatObject(result));
  } catch (e) {
    print.error(e.stack);
  } finally {
    utils.destroyProcess();
  }
};
